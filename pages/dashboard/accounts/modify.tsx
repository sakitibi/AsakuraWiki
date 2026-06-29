import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { notuseUsername } from '@/utils/user_list';
import { encrypt as secureEncrypt } from "@/lib/secureObfuscator";
import Head from 'next/head';
import { User } from '@supabase/auth-helpers-react';
import { gzipAndBase64 } from '@/lib/base64';
import { BirthDayProps, CountrieTypes, GenderTypes, getAge } from '@/pages/login/13nin/signup';

export default function ModifyPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [gender, setGender] = useState<GenderTypes>('man');
    const [username, setUsername] = useState('');
    const [shimei, setShimei] = useState<string>('');
    const [view_font, setView_Font] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [provider, setProvider] = useState<string | undefined>();
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
                setProvider(data.user.app_metadata.provider);
            }
        });
    }, []);
    useEffect(() => {
        if (!user || typeof localStorage === "undefined") return;
        setEmail(user.email || "");
        setBirthday(user.user_metadata.birthday);
        setCountries(user.user_metadata.countries);
        setGender(user.user_metadata.gender);
        setShimei(user.user_metadata.shimei);
        setUsername(user.user_metadata.username);
        setView_Font(localStorage.getItem("font_setting") || "");
    }, [user]);

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));
    const handleModify = async (e: React.FormEvent) => {
        console.log('handleModify fired');
        const initialEmail = user?.email ?? '';
        try{
            console.log('[modify] user.id:', user?.id);
            e.preventDefault();
            setLoading(true);
            setErrorMsg('');
            if (!user){
                setErrorMsg('未ログインです');
                setLoading(false);
                return;
            }
            if (!!notuseUser_list_found) {
                setErrorMsg('このユーザー名は使用出来ません。');
                setLoading(false);
                return;
            }

            const checkerBirthday: BirthDayProps = {
                year: parseInt(birthday.split("-")[0], 10),
                month: parseInt(birthday.split("-")[1], 10),
                date: parseInt(birthday.split("-")[2], 10)
            }
    
            if (getAge(checkerBirthday) < 18) {
                setGender(gender === "woman" ? "girl" : "boy");
            }

            setTimeout(async () => {
                // メタデータ暗号化
                const updatedInputs: string[] | undefined = await secureEncrypt(
                    email, password, birthday, username, countries,
                    gender === "woman" ? "girl" : "boy", shimei
                );

                // 暗号化メタデータ送信
                try {
                    if (!updatedInputs) {
                        setErrorMsg("暗号化に失敗しました");
                        setLoading(false);
                        return;
                    }
                    
                    localStorage.setItem("font_setting", view_font);
                    const compressed = gzipAndBase64(JSON.stringify(updatedInputs));
                    if (updatedInputs) {
                        const { error } = await supabaseClient
                            .from("user_metadatas")
                            .update({
                                metadatas: compressed,
                                version: 3
                            })
                            .eq("id", user.id);

                        if (error) {
                            setErrorMsg(error.message);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("メタデータ送信エラー: ", e);
                    setErrorMsg('メタデータの送信に失敗しました');
                    setLoading(false);
                    return;
                }

                const updateAuth: {
                    email?: string
                    password?: string
                } = {}

                if (password && password.length >= 6) {
                    updateAuth.password = password
                }

                if (email && email !== initialEmail) {
                    updateAuth.email = email
                }

                if (Object.keys(updateAuth).length > 0) {
                    const res = await fetch('/api/accounts/update-auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            email: updateAuth.email,
                            password: updateAuth.password,
                        }),
                    })

                    const json = await res.json();

                    if (!res.ok) {
                        setErrorMsg(json.error ?? 'Auth更新に失敗しました')
                        setLoading(false)
                        return
                    }
                }
                setLoading(false);
                window.location.href = '/dashboard';
            }, 1000);
        } catch(e){
            console.error("Error: ", e);
            setLoading(false);
            return;
        }
    };

    return provider === "email" ? (
        <>
            <Head>
                <title>13ninアカウントを情報変更</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 500 }}>
                <h1>
                    <i className="fa-duotone fa-solid fa-user-pen"></i>
                    13ninアカウントを情報変更
                </h1>
                <form onSubmit={handleModify}>
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <input 
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <input 
                        type="text"
                        placeholder="氏名"
                        value={shimei}
                        onChange={e => setShimei(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <label>
                        性別
                        <select
                            value={gender === "woman" || gender === "girl" ? "woman" : "man"}
                            onChange={(e) =>
                                setGender(e.target.value as GenderTypes)
                            }
                            required
                        >
                            <option selected value="man">男</option>
                            <option value="woman">女</option>
                        </select>
                    </label>
                    <br /><br />
                    <label>
                        生年月日
                        <input
                            type="date"
                            value={birthday}
                            onChange={e => setBirthday(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </label>
                    <br /><br />
                    <label>
                        国籍(通知・お知らせメールの言語に影響)
                        <select
                            value={countries}
                            onChange={(e) =>
                                setCountries(e.target.value as CountrieTypes)
                            }
                            required
                        >
                            <option selected value="japan">日本 Japan</option>
                            <option value="russia">ロシア Русский</option>
                            <option value="others">その他 Others</option>
                        </select>
                    </label>
                    <br /><br />
                    <label>
                        サイト表示フォント
                        <select
                            value={view_font}
                            onChange={(e) =>
                                setView_Font(e.target.value)
                            }
                            required
                        >
                            <option selected value="noto_sans_japanese">Noto Sans Japanese, sans-serif</option>
                            <option value="udshingo_kyokasho">UDデジタル教科書体 ProN</option>
                        </select>
                    </label>
                    <input
                        type="text"
                        placeholder="ユーザー名"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                    <button type="submit" disabled={loading}>
                        <span>{loading ? '情報変更中…' : '情報変更'}</span>
                    </button>
                </form>
            </main>
        </>
    ) : (
        <>
            <Head>
                <title>403 Forbidden</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 600 }}>
                <h1>403 Forbidden</h1>
                <p>13ninアカウントを情報変更する権限が有りません</p>
                <p><a href="/login/13nin">他のアカウントにログイン</a></p>
            </main>
        </>
    );
}

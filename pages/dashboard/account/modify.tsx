import { useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { notuseUsername } from '@/utils/user_list';
import { encrypt as secureEncrypt } from "@/lib/secureObfuscator";
import Head from 'next/head';
import { User, useUser } from '@supabase/auth-helpers-react';

export type JenderTypes = "men" | "woman";
export type CountrieTypes = "japan" | "russia" | "others";

export default function ModifyPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [jender, setJender] = useState<JenderTypes>('men');
    const [username, setUsername] = useState('');
    const [shimei, setShimei] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const user:User | null = useUser();
    const provider = user?.app_metadata.provider;

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));
    const handleModify = async (e: React.FormEvent) => {
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

        // メタデータ暗号化
        const updatedInputs:string[] = secureEncrypt(
            email, password, birthday, username, countries,
            jender, shimei
        );

        // Supabase にユーザー変更（email/passwordは平文でOK）
        const updateAuth: {
        email?: string
        password?: string
        } = {}

        if (email.trim() !== '') {
            updateAuth.email = email
        }

        if (password.trim() !== '') {
            updateAuth.password = password
        }

        if (Object.keys(updateAuth).length > 0) {
            const { error } = await supabaseServer.auth.updateUser(updateAuth)
            if (error) {
                setErrorMsg(error.message)
                return
            }
        }
        // 暗号化メタデータ送信
        try {
            const filtered = updatedInputs.filter(i => i && i.trim() !== '');
            console.log("filtered: ", filtered);
            if (filtered.length > 0) {
                const { error } = await supabaseServer
                    .from("user_metadatas")
                    .update({
                        metadatas: filtered,
                    })
                    .eq("id", user!.id)
                    .select();
                if(error){
                    console.error("Error: ", error.message);
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

        setLoading(false);
        window.location.href = '/dashboard';
    };

    return provider === "email" ? (
        <>
            <Head>
                <title>13ninアカウントを情報変更</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 500 }}>
                <h1>📝 情報変更</h1>
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
                            value={jender}
                            onChange={(e) =>
                                setJender(e.target.value as JenderTypes)
                            }
                            required
                        >
                            <option selected value="men">男</option>
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

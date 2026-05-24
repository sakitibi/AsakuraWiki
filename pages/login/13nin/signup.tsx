import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { notuseUsername } from '@/utils/user_list';
import { encrypt as secureEncrypt } from "@/lib/secureObfuscator";
import Head from 'next/head';
import { encodeBase64Unicode, gzipAndBase64 } from '@/lib/base64';
import upack from '@/node_modules/upack.js/src/index';

export type GenderTypes = "man" | "woman" | "boy" | "girl";
export type CountrieTypes = "japan" | "russia" | "others";
export interface BirthDayProps {
    year: number;
    month: number;
    date: number;
}

export function getAge(birthday: BirthDayProps) {
    // 今日の日付
    const today = new Date();
    // 今年の誕生日の日付
    const thisYearsBirthday = new Date(today.getFullYear(), birthday.month - 1, birthday.date);
    // 年齢を計算
    let age = today.getFullYear() - birthday.year;
    // 誕生日がまだ来ていない場合、年齢を1引く
    if (today < thisYearsBirthday) {
        age--;
    }
    return age;
}

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [gender, setGender] = useState<GenderTypes>('man');
    const [username, setUsername] = useState('');
    const [shimei, setShimei] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [userMeta, setUserMeta] = useState<any[]>([]);
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const notuseUser_list_found = notuseUsername.some(re => re.test(username));
        if (notuseUser_list_found) {
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

        // メタデータ暗号化
        setTimeout(async () => {
            const updatedInputs:string[] | undefined = await secureEncrypt(
                email, password, birthday, username, countries,
                gender, shimei
            );

            // Supabase にユーザー登録（email/passwordは平文でOK）
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        birthday,
                        countries,
                        shimei,
                        gender
                    }
                }
            });

            if (error || !data.user) {
                setErrorMsg(error?.message || '登録失敗');
                setLoading(false);
                return;
            }

            // 暗号化メタデータ送信
            try {
                if (!updatedInputs) {
                    setErrorMsg("暗号化に失敗しました");
                    setLoading(false);
                    return;
                }
                const compressed = gzipAndBase64(JSON.stringify(updatedInputs));
                if (updatedInputs) {
                    const session = await supabaseClient.auth.getSession();
                    const token = encodeBase64Unicode(await upack.SEncoder.encodeSEncode(
                        (new TextEncoder().encode(session?.data?.session?.access_token || "")).buffer,
                        process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!
                    )!);
                    const res = await fetch('/api/accounts/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ metadatas: compressed }),
                    });
                    const newItem = await res.json();
                    setUserMeta([...userMeta, newItem]);
                }
            } catch (e) {
                console.error("メタデータ送信エラー: ", e);
                setErrorMsg('メタデータの送信に失敗しました');
                setLoading(false);
                return;
            }

            setLoading(false);
            window.location.href = '/dashboard';
        }, 1000);
    };

    return (
        <>
            <Head>
                <title>13ninアカウントを新規登録</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 500 }}>
                <h1>📝 新規登録</h1>
                <form onSubmit={handleSignUp}>
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
                            value={gender}
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
                    <input
                        type="text"
                        placeholder="ユーザー名"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <label>
                        <a href="/policies">あさクラWiki利用規約</a>に同意
                        <input
                            type="checkbox"
                            required
                        />
                    </label>
                    <br /><br />
                    <label>
                        <a href="https://sakitibi-com9.webnode.jp/page/10">13nin利用規約</a>に同意
                        <input
                            type="checkbox" 
                            required
                        />
                    </label>
                    <br/><br/>
                    {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                    <button type="submit" disabled={loading}>
                        <span>{loading ? '登録中…' : '新規登録'}</span>
                    </button>
                </form>
            </main>
        </>
    );
}

import { useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { notuseUsername } from '@/utils/user_list';
import { encrypt as secureEncrypt } from "@/lib/secureObfuscator";
import Head from 'next/head';

export type JenderTypes = "men" | "woman";
export type CountrieTypes = "japan" | "russia" | "others";

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [jender, setJender] = useState<JenderTypes>('men');
    const [username, setUsername] = useState('');
    const [shimei, setShimei] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [userMeta, setUserMeta] = useState<any[]>([]);

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (!!notuseUser_list_found) {
            setErrorMsg('このユーザー名は使用出来ません。');
            setLoading(false);
            return;
        }

        // メタデータ暗号化
        const updatedInputs:string[] = await secureEncrypt(
            email, password, birthday, username, countries,
            jender, shimei
        );

        // Supabase にユーザー登録（email/passwordは平文でOK）
        const { data, error } = await supabaseServer.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    birthday,
                    countries,
                    shimei,
                    jender
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
            const filtered = updatedInputs.filter(i => i && i.trim() !== '');
            console.log("filtered: ", filtered);
            if (filtered.length > 0) {
                const session = await supabaseServer.auth.getSession();
                const token = session?.data?.session?.access_token;
                const res = await fetch('/api/accounts/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ metadatas: filtered }),
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

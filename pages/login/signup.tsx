import { useEffect, useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { notuseUsername } from '@/utils/user_list';
import {
    encrypt as secureEncrypt
} from "@/lib/secureObfuscator";
import Head from 'next/head';

export default function SignUpPage() {
    const [email, setEmail] = useState<string>('');
    const [userMeta, setUserMeta] = useState<string[]>([]);
    const [password, setPassword] = useState<string>('');
    const [birthday, setBirthday] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [seedForRandom, setSeedForRandom] = useState<string>("");

    const notuseUser_list_found:RegExp | undefined = notuseUsername.find(value => username.match(value));
    const showError = (e: unknown) => {
        console.error(e);
    };
    async function onRun(text:string) {
        try {
            const c = await secureEncrypt(text, seedForRandom);
            return c;
        } catch (e) {
            showError(e);
        }
    }
    useEffect(() => {
        setSeedForRandom(Math.floor(Math.random() * 2147483647).toString(36));
    }, []);
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (notuseUser_list_found!) {
            setErrorMsg('このユーザー名は使用出来ません。');
            console.error("error notused username: ", username);
            setLoading(false);
            return;
        }
        const updatedInputs = [
            await onRun(email) as string,
            await onRun(password) as string,
            await onRun(birthday) as string,
            await onRun(username) as string,
            seedForRandom
        ];
        // 先に Supabase でユーザー登録
        const { data, error } = await supabaseServer.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    birthday
                }
            }
        });

        if (error || !data.user) {
            setErrorMsg(error?.message || '登録失敗');
            setLoading(false);
            return;
        }
        // 登録成功後にメタデータ送信
        const addItem = async () => {
            try {
                const filtered:(string | undefined)[] = updatedInputs.filter(i => i!.trim() !== '');
                if (filtered!.length === 0) return false;
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
                // 本体で JSON を取得
                const newItem = await res.json();
                setUserMeta([...userMeta, newItem]);
                return true;
            } catch (e: any) {
                console.error("error: ", e);
                return false;
            }
        };

        const success = await addItem();
        if (!success) {
            setErrorMsg('メタデータの送信に失敗しました');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            setLoading(false);
            window.location.href = '/dashboard';
        }, 2000);
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <input
                        type="date"
                        placeholder="生年月日"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
                    <input
                        type="text"
                        placeholder="ユーザー名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        <span>
                            {loading ? '登録中…' : '新規登録'}
                        </span>
                    </button>
                </form>
            </main>
        </>
    );
}
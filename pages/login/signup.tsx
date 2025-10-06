import { useEffect, useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { notuseUsername } from '@/utils/user_list';
import { encrypt as secureEncrypt } from "@/lib/secureObfuscator";
import Head from 'next/head';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [seedForRandom, setSeedForRandom] = useState<string | null>(null);
    const [userMeta, setUserMeta] = useState<any[]>([]);

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));

    useEffect(() => {
        setSeedForRandom(Math.floor(Math.random() * 2147483647).toString(36));
    }, []);

    const showError = (e: unknown) => console.error(e);

    // 安全に暗号化する関数
    async function onRun(text: string): Promise<string> {
        if (!seedForRandom) throw new Error("暗号化用のシードがまだ初期化されていません");
        try {
            const result = await secureEncrypt(text, seedForRandom);
            if (!result) throw new Error("暗号化に失敗しました");
            return result;
        } catch (e) {
            showError(e);
            throw e;
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (!!notuseUser_list_found) {
            setErrorMsg('このユーザー名は使用出来ません。');
            setLoading(false);
            return;
        }

        if (!seedForRandom) {
            setErrorMsg('暗号化用のシードがまだ初期化されていません');
            setLoading(false);
            return;
        }

        let updatedInputs: string[];
        try {
            updatedInputs = [
                await onRun(email),
                await onRun(password),
                await onRun(birthday),
                await onRun(username),
                seedForRandom
            ];
        } catch (e) {
            setErrorMsg('暗号化に失敗しました');
            setLoading(false);
            return;
        }

        // Supabase にユーザー登録
        const { data, error } = await supabaseServer.auth.signUp({
            email,
            password,
            options: { data: { username, birthday } }
        });

        if (error || !data.user) {
            setErrorMsg(error?.message || '登録失敗');
            setLoading(false);
            return;
        }

        // メタデータ送信
        try {
            const filtered = updatedInputs.filter(i => i && i.trim() !== '');
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
                        type="date"
                        placeholder="生年月日"
                        value={birthday}
                        onChange={e => setBirthday(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    <br /><br />
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
                    <button type="submit" disabled={loading || !seedForRandom}>
                        <span>{loading ? '登録中…' : '新規登録'}</span>
                    </button>
                </form>
            </main>
        </>
    );
}

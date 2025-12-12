import { useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import Link from 'next/link';
import Head from 'next/head';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email,
            password,
        });

        console.log('Login Data:', data);
        console.log('Login Error:', error);

        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            window.location.href = '/dashboard';
        }
    };

    return (
        <>
            <Head>
                <title>13ninアカウントでログイン</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 500 }}>
                <h1>
                    <i
                        className="fa-solid fa-key"
                        style={{ fontSize: 'inherit' }}
                    ></i>
                    13ninアカウントでログイン
                </h1>
                <form onSubmit={handleLogin}>
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
                    {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                    <button type="submit" disabled={loading}>
                        <span>
                            {loading ? 'ログイン中…' : 'ログイン'}
                        </span>
                    </button>
                </form>
                <h2>まだアカウントを持っていませんか?</h2>
                <Link href="/login/13nin/signup">
                    <a>
                        <button><span>新規登録</span></button>
                    </a>
                </Link>
            </main>
        </>
    );
}
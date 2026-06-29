import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import upack from '@/node_modules/upack.js/src/index';
import { encodeBase64Unicode } from '@/lib/base64';
import { supabaseClient } from '@/lib/supabaseClient';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        const encoded = encodeBase64Unicode(
            await upack.SEncoder.encodeSEncode(
                upack.encoder.encode(
                    JSON.stringify({
                        email,
                        password
                    })
                ),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            )
        );

        const res = await fetch("/api/accounts/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ua: navigator.userAgent,
                data: encoded
            })
        })

        setLoading(false);

        if (!res.ok) {
            setErrorMsg("トークンが発行出来ませんでした。");
            return;
        } else {
            const data = await res.json();
            const access_token = 
                await upack.SEncoder.decodeSEncode(
                    data.access_token,
                    process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                    true,
                    5
                ) as string;

            const refresh_token = 
                await upack.SEncoder.decodeSEncode(
                    data.refresh_token,
                    process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                    true,
                    5
                ) as string;

            const { error } = await supabaseClient.auth.setSession({
                access_token: access_token,
                refresh_token: refresh_token
            });

            if (error) {
                console.error("Login Error: ", error.message);
                setErrorMsg("ログイン出来ませんでした。");
                return;
            }
            window.location.replace('/dashboard');
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
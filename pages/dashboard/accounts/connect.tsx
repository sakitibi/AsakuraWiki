import { supabaseClient } from '@/lib/supabaseClient';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function BrowserLoginSuccess() {
    const [loading, setLoading] = useState(false);
    const [pinCode, setPinCode] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [error, setError] = useState<string | null>(null);

    const generateAlphanumericCode = (): string => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleGenerateCode = async () => {
        setLoading(true);
        setError(null);
        setPinCode(null);

        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !session) {
            setError('ブラウザ側でセッションが見つかりません。再ログインしてください。');
            setLoading(false);
            return;
        }

        const code = generateAlphanumericCode();

        const { error: insertError } = await supabaseClient
            .from('app_links')
            .insert({
                code: code,
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

        if (insertError) {
            console.error(insertError);
            setError('認証コードの発行に失敗しました。もう一度お試しください。');
            setLoading(false);
            return;
        }

        setPinCode(code);
        setTimeLeft(30);
        setLoading(false);
    };

    useEffect(() => {
        if (pinCode === null || timeLeft <= 0) {
            if (timeLeft === 0) setPinCode(null);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, pinCode]);

    return (
        <>
            <Head>
                <title>認証コード発行</title>
            </Head>
            <main style={{
                maxWidth: '450px',
                margin: '40px auto',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
                <h1>認証コード発行</h1>
                <p style={{
                    color: '#4b5563',
                    fontSize: '0.9rem',
                    marginBottom: '2rem'
                }}>
                    デスクトップアプリへログイン情報を同期するための認証コードを発行します。
                </p>

                {error && (
                    <p style={{
                        color: '#ef4444',
                        backgroundColor: '#fef2f2',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                    }}>
                        ⚠️ {error}
                    </p>
                )}

                {!pinCode ? (
                    <button
                        onClick={handleGenerateCode}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            fontSize: '1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        <span>{loading ? 'コードを生成中...' : 'アプリ同期コードを発行'}</span>
                    </button>
                ) : (
                    <div>
                        <div style={{
                            backgroundColor: '#f3f4f6',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                            }}>
                            <span style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.4rem',
                                color: '#111827',
                                fontFamily: 'monospace'
                            }}>
                                {pinCode}
                            </span>
                        </div>
                        
                        <p style={{
                            color: '#dc2626',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            margin: '0'
                        }}>
                            有効期限: あと {timeLeft} 秒
                        </p>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '0.8rem',
                            marginTop: '0.5rem'
                        }}>
                            ※大文字・小文字を区別して入力してください。
                        </p>
                        
                        <button onClick={handleGenerateCode} style={{
                            marginTop: '1rem',
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.85rem'
                        }}>
                            <span>新しいコードを再発行する</span>
                        </button>
                    </div>
                )}
            </main>
        </>
    );
}
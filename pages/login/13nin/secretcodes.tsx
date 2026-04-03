import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { decryptV2, encryptedDataProps } from '@/lib/secureObfuscator';
import { ungzipFromBase64 } from "@/lib/base64";
import Head from 'next/head';

export default function LoginPage() {
    const [secretCode, setSecretCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    async function secretCodeAPIFetched(): Promise<any> {
        try {
            const res = await fetch("/api/accounts/secretcode", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': secretCode.trim()
                }
            });
            if (!res.ok) {
                const error = await res.json();
                console.error("API error:", error);
                setErrorMsg(error.error || "不明なエラー");
                return null;
            }
            const data = await res.json();
            localStorage.setItem("secretcodeSessions", secretCode)
            return data;
        } catch (e: any) {
            console.error("error: ", e);
            return null;
        }
    }
    useEffect(() => {
        try{
            const session = localStorage.getItem("secretcodeSessions") ?? null;
            if(session){
                setSecretCode(session);
            }
        } catch(e){
            console.error("SessionRestoreError: ", e);
        }
    }, []);
    const handleLogin = async (e: React.FormEvent) => {
        try{
            e.preventDefault();
            setLoading(true);
            setErrorMsg('');
            const fetched = await secretCodeAPIFetched();
            console.log("fetched: ", fetched);
            if (!fetched) {
                setErrorMsg("ログイン情報が取得できませんでした");
                setLoading(false);
                return;
            }
            if (
                !fetched
            ) {
                setErrorMsg("ログイン情報が取得できませんでした");
                setLoading(false);
                return;
            }
            const raw = fetched!.metadatas; // Supabaseから取得
            const jsonString = ungzipFromBase64(raw);
            const parsed:encryptedDataProps[] = JSON.parse(jsonString);
            const decrypted = await decryptV2(parsed, fetched!.email)
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: decrypted![0],
                password: decrypted![1],
            });
            console.log('Login Data:', data);
            console.log('Login Error:', error);
            setLoading(false);
            if (error) {
                setErrorMsg(error.message);
            } else {
                window.location.href = '/dashboard';
            }
        } catch(e){
            console.error("error: ", e)
        } finally{
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>あさクラシークレットコードでログイン</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 500 }}>
                <h1>あさクラシークレットコードでログイン</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="あさクラシークレットコード"
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
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
                <Link href="./signup">
                    <a>
                        <button><span>新規登録</span></button>
                    </a>
                </Link>
            </main>
        </>
    );
}
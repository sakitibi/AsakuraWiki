import { useEffect, useState } from 'react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import Link from 'next/link';
import { decrypt } from '@/lib/secureObfuscator';

export default function LoginPage() {
    const [secretCode, setSecretCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [returned, setReturned] = useState<any>(null);
    async function secretCodeAPIFetched() {
        try{
            const res = await fetch("/api/accounts/secretcode", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `SecretCodes ${secretCode}`
                }
            });
            if (!res.ok) {
                const error = await res.json();
                console.error("API error:", error);
                setErrorMsg(error.error || "不明なエラー");
                return;
            }
            const data = await res.json();
            setReturned(data);
        } catch(e:any){
            console.error("error: ", e);
        }
    }
    const handleLogin = async (e: React.FormEvent) => {
        try{
            e.preventDefault();
            setLoading(true);
            setErrorMsg('');
            await secretCodeAPIFetched();
            console.log("returned: ", returned);
            if (!returned || !returned[0]?.metadatas?.[0] || !returned[0]?.metadatas?.[1]) {
                setErrorMsg("ログイン情報が取得できませんでした");
                setLoading(false);
                return;
            }
            const { data, error } = await supabaseServer.auth.signInWithPassword({
                email: decrypt(returned[0]!.metadatas[0]),
                password: decrypt(returned[0]!.metadatas[1]),
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
    );
}
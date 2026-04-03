import { useEffect, useState } from 'react';
import Head from 'next/head';
import { asakuraMenberUserId } from '@/utils/user_list';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function CreateSecretCode() {
    const [loading, setLoading] = useState<boolean>(false);
    const [secretCode, setSecretCode] = useState<string>("");
    const [user, setUser] = useState<User | null>(null);
    const [provider, setProvider] = useState<string | undefined>();
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
                setProvider(data.user.app_metadata.provider);
            }
        });
    }, []);
    const asakura_menber_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);
    useEffect(() => {
        console.log("provider: ", provider);
    }, [provider]);
    const handleClick = async () => {
        if (typeof document === "undefined" || typeof window === "undefined") return;
        setLoading(true);
        setSecretCode("");
        localStorage.removeItem("secretcodeSessions");
        // ログインユーザー取得
        if (!user) {
            alert('ログインしてください');
            setLoading(false);
            return;
        }
        const session = await supabaseClient.auth.getSession();
        const token = session?.data?.session?.access_token;
        const res:Response = await fetch("/api/accounts/secretcode", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: String(!!asakura_menber_found && provider === "email")
        })
        if (!res.ok) {
            const error = await res.text();
            alert('あさクラシークレットコードの作成に失敗しました: ' + error);
            console.error('あさクラシークレットコードの作成に失敗しました: ', error);
            setLoading(false);
            return;
        }
        const data = await res.json();
        console.log("data: ", data);
        setSecretCode(data.jwt);
        setLoading(false);
    };

    const fileDownload = () => {
        if(!secretCode) return;
        const bytes = new TextEncoder().encode(secretCode);
        const blob = new Blob([bytes], {
            type: "text/plain"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "secretcode.txt";
        a.click();
    }

    useEffect(() => {
        if(secretCode){
            localStorage.setItem("secretcodeSessions", secretCode);
        }
    }, [secretCode]);

    return (
        <>
            {!!asakura_menber_found && provider === "email" ? (
                <>
                    <Head>
                        <title>あさクラシークレットコードを作る</title>
                    </Head>
                    <main style={{ padding: '2rem', maxWidth: 600 }}>
                        <h1>
                            <i
                                className="fa-solid fa-key"
                                style={{ fontSize: 'inherit' }}
                            ></i>
                            あさクラシークレットコードを作る
                        </h1>
                        <p>注意 13ninアカウントでログインしないと<br/>この機能は使用出来ません</p>
                        <button onClick={async() => await handleClick()} disabled={loading}>
                            <span>{loading ? '作成中…' : 'あさクラシークレットコードを作成'}</span>
                        </button>
                        {secretCode ? (
                            <>
                                <button onClick={fileDownload} disabled={loading}>
                                    <span>シークレットコード付きのファイルをダウンロードする</span>
                                </button>
                            </>
                        ) : null}
                    </main>
                </>
            ) : (
                <>
                    <Head>
                        <title>403 Forbidden</title>
                    </Head>
                    <main style={{ padding: '2rem', maxWidth: 600 }}>
                        <h1>403 Forbidden</h1>
                        <p>あさクラシークレットコードを作成する権限が有りません</p>
                        <p><a href="/login/13nin">他のアカウントにログイン</a></p>
                    </main>
                </>
            )}
        </>
    );
}
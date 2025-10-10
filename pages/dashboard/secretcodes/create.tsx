import { useState } from 'react';
import { supabaseServer } from 'lib/supabaseClientServer';
import Head from 'next/head';
import { asakuraMenberUserId } from '@/utils/user_list';
import { User, useUser } from '@supabase/auth-helpers-react';

export default function CreateSecretCode() {
    const [loading, setLoading] = useState<boolean>(false);
    const asakura_menber_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);
    const user:User | null = useUser();
    const provider = user?.app_metadata.provider;
    const handleClick = async () => {
        setLoading(true);
        // ログインユーザー取得
        if (!user) {
            alert('ログインしてください');
            setLoading(false);
            return;
        }
        const session = await supabaseServer.auth.getSession();
        const token = session?.data?.session?.access_token;
        const res:Response = await fetch("/api/accounts/secretcode", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await res.json();
        // 1) wikis テーブルに挿入
        const {error: SecretCodeError} = await supabaseServer
            .from('user_metadatas')
            .update({
                secretcode: data.jwt
            })
            .eq("id", user?.id)
        if (SecretCodeError) {
            alert('あさクラシークレットコードの作成に失敗しました: ' + SecretCodeError.message);
            setLoading(false);
            return;
        }
        console.log("isOK: ", !!asakura_menber_found && provider === "email")
        setLoading(false);
    };

    return (
        <>
            {!!asakura_menber_found && provider === "email" ? (
                <>
                    <Head>
                        <title>あさクラシークレットコードを作る</title>
                    </Head>
                    <main style={{ padding: '2rem', maxWidth: 600 }}>
                        <h1>あさクラシークレットコードを作る</h1>
                        <p>注意 13ninアカウントでログインしないと<br/>この機能は使用出来ません</p>
                        <button onClick={async() => await handleClick()} disabled={loading}>
                            <span>{loading ? '作成中…' : 'あさクラシークレットコードを作成'}</span>
                        </button>
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
                        <p><a href="/login/email">他のアカウントにログイン</a></p>
                    </main>
                </>
            )}
        </>
    );
}
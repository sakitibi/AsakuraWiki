import { useState } from 'react';
import { supabaseServer } from 'lib/supabaseClientServer';
import Head from 'next/head';

export default function CreateWikiPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const handleClick = async () => {
        setLoading(true);
        // ログインユーザー取得
        const { data: { user } } = await supabaseServer.auth.getUser();
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
                secretcode: data
            })
            .eq("id", user?.id)
        if (SecretCodeError) {
            alert('あさクラシークレットコードの作成に失敗しました: ' + SecretCodeError.message);
            setLoading(false);
            return;
        }
        setLoading(false);
    };

    return (
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
    );
}
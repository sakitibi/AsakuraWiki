import { useState } from 'react';
import { supabaseServer } from 'lib/supabaseClientServer';
import Head from 'next/head';

export default function CreateWikiPage() {
    const [secretCode, setSecretCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // ログインユーザー取得
        const { data: { user } } = await supabaseServer.auth.getUser();
        if (!user) {
            alert('ログインしてください');
            setLoading(false);
            return;
        }
        // 1) wikis テーブルに挿入
        const {error: SecretCodeError} = await supabaseServer
            .from('user_metadatas')
            .update({
                secretcode: secretCode
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
                <form onSubmit={handleSubmit}>
                    <label>
                    あさクラシークレットコード:
                    <input
                        value={secretCode}
                        onChange={(e) => setSecretCode(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                    </label>
                    <br/><br/>
                    <button type="submit" disabled={loading}>
                    <span>{loading ? '作成中…' : 'あさクラシークレットコードを作成'}</span>
                    </button>
                </form>
            </main>
        </>
    );
}
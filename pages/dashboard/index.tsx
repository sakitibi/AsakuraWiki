import { useUser } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/FooterJp';

export default function DashboardPage() {
    const user = useUser();
    const name =
        user?.user_metadata?.name ||  // GitHubログインなどの表示名
        user?.user_metadata?.full_name || // その他のプロバイダー
        user?.user_metadata?.username || // カスタムフィールド
        user?.email ||                   // 最後の手段
        'ゲスト';
    return (
        <>
            <Head>
                <title>ダッシュボード</title>
            </Head>
            <main style={{ padding: '2rem' }}>
                <h1>🎉 ダッシュボード</h1>
                {user ? (
                    <div id="content">
                        <p>こんにちは、{name} さん！</p>
                        <div id="dashboard"></div>
                    </div>
                ) : (
                    <p>ログインが必要です</p>
                )}
            </main>
            <FooterJp/>
        </>
    );
}
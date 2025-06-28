import { useUser } from '@supabase/auth-helpers-react';

export default function DashboardPage() {
    const user = useUser();
    const name =
        user?.user_metadata?.name ||  // GitHubログインなどの表示名
        user?.user_metadata?.full_name || // その他のプロバイダー
        user?.user_metadata?.username || // カスタムフィールド
        user?.email ||                   // 最後の手段
        'ゲスト';

    return (
        <main style={{ padding: '2rem' }}>
            <h1>🎉 ダッシュボード</h1>
            {user ? (
                <p>こんにちは、{name} さん！</p>
            ) : (
                <p>ログインが必要です</p>
            )}
        </main>
    );
}
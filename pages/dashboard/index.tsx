import { useUser, User } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const user:User | null = useUser();
    const [loading, setLoading] = useState<boolean>(true);
    const name:string =
        user?.user_metadata?.name ||  // GitHubログインなどの表示名
        user?.user_metadata?.full_name || // その他のプロバイダー
        user?.user_metadata?.username || // カスタムフィールド
        user?.email ||                   // 最後の手段
        'ゲスト';
    const handleLogout = async() => {
        try{
            setLoading(true);
            await supabaseServer.auth.signOut();
        } catch(e:any){
            console.error("error: ", e);
        } finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        setLoading(false);
    }, []);
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
                        <div id="dashboard">
                            <button
                                disabled={loading}
                                onClick={async() => await handleLogout()}
                            >
                                <span>ログアウト</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>ログインが必要です</p>
                )}
            </main>
            <FooterJp/>
        </>
    );
}
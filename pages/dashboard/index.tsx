import { useUser, User } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { useEffect, useState } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';

export default function DashboardPage() {
    const user:User | null = useUser();
    const [loading, setLoading] = useState<boolean>(true);
    const asakura_menber_found:string | undefined = asakuraMenberUserId.find(value => value === user?.id);
    const name:string =
        user?.user_metadata?.name ||  // GitHubログインなどの表示名
        user?.user_metadata?.full_name || // その他のプロバイダー
        user?.user_metadata?.username || // カスタムフィールド
        user?.email ||                   // 最後の手段
        'ゲスト';
    const provider = user?.app_metadata.provider;
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
    const createSecretCode = () => {
        window.location.href = "/dashboard/secretcodes/create";
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
                            <button
                                disabled={loading || !asakura_menber_found || provider !== "email"}
                                onClick={createSecretCode}
                            >
                                <span>あさクラシークレットコードの作成
                                    {!asakura_menber_found || provider !== "email" ? "(使用不可)" : null}
                                </span>
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
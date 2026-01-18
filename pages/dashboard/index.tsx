import { User } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { useEffect, useState } from 'react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { supabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';

interface MyWikiProps{
    name: string;
    slug: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [mywikis, setMywikis] = useState<MyWikiProps[]>([]);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
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
            await supabaseClient.auth.signOut();
            location.reload();
        } catch(e:any){
            console.error("error: ", e);
        } finally{
            setLoading(false);
        }
    }
    const createSecretCode = () => {
        if (loading || !asakura_menber_found || provider !== "email") return;
        window.location.href = "/dashboard/secretcodes/create";
    }
    const AccountModify = () => {
        if (loading || !asakura_menber_found || provider !== "email") return;
        window.location.href = "/dashboard/accounts/modify";
    }
    useEffect(() => {
        if(!user) return;
        async function MyWikiFetch(){
            const { data, error } = await supabaseClient
                .from("wikis")
                .select("name, slug")
                .eq("owner_id", user?.id)
            if(!data || error){
                console.error("Error: ", error.message);
                return;
            }
            setMywikis(data);
        }
        MyWikiFetch();
    }, [user]);
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
                            <div id="my_wiki_container">
                                {mywikis.map((data, index) => (
                                    <>
                                        <div key={index}>
                                            <button>
                                                <Link href={`/dashboard/wiki/${data.slug}`}>
                                                    <span>
                                                        {data.name} Wiki* を管理
                                                    </span>
                                                </Link>
                                            </button>
                                        </div>
                                    </>
                                ))}
                            </div>
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
                            <button
                                disabled={loading || provider !== "email"}
                                onClick={AccountModify}
                            >
                                <span>13ninアカウント情報変更
                                    {provider !== "email" ? "(使用不可)" : null}
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p>401 ログインが必要です</p>
                        <p><a href="/login">ここからログインして下さい</a></p>
                        <p><a href="/login/13nin/signup">13ninアカウントが無い場合は新規作成して下さい</a></p>
                    </>
                )}
            </main>
            <FooterJp/>
        </>
    );
}
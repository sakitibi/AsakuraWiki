import { GetServerSideProps } from 'next';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import Link from 'next/link';
import { User } from '@supabase/auth-helpers-react';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { asakuraMenberUserId } from '@/utils/user_list';

interface MyWikiProps {
    name: string;
    slug: string;
}

interface DashboardProps {
    user: User | null;
    mywikis: MyWikiProps[];
}

export default function DashboardPage({ user, mywikis }: DashboardProps) {
    const asakura_menber_found =
        user && asakuraMenberUserId.includes(user.id);

    const name =
        user?.user_metadata?.name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.username ||
        user?.email ||
        'ゲスト';

    const provider = user?.app_metadata?.provider;

    const handleLogout = async () => {
        await fetch('/api/logout');
        location.reload();
    };

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
                                {mywikis.map((data) => (
                                    <div key={data.slug}>
                                        <Link href={`/dashboard/wiki/${data.slug}`}>
                                            <button>
                                                <span>
                                                    <i className="fa-solid fa-folder-gear" />
                                                    {data.name} Wiki* を管理
                                                </span>
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleLogout}>
                                <span>ログアウト</span>
                            </button>

                            <button
                                disabled={!asakura_menber_found || provider !== 'email'}
                                onClick={() =>
                                    (location.href = '/dashboard/secretcodes/create')
                                }
                            >
                                <span>
                                    あさクラシークレットコードの作成
                                    {!asakura_menber_found || provider !== 'email'
                                        ? '(使用不可)'
                                        : null}
                                </span>
                            </button>

                            <button
                                disabled={provider !== 'email'}
                                onClick={() =>
                                    (location.href = '/dashboard/accounts/modify')
                                }
                            >
                                <span>
                                    13ninアカウント情報変更
                                    {provider !== 'email' ? '(使用不可)' : null}
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p>401 ログインが必要です</p>
                        <p>
                            <a href="/login">ここからログインして下さい</a>
                        </p>
                        <p>
                            <a href="/login/13nin/signup">
                                13ninアカウントが無い場合は新規作成して下さい
                            </a>
                        </p>
                    </>
                )}
            </main>
            <FooterJp />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return ctx.req.cookies[name];
                },
                set(name: string, value: string, options: any) {
                    ctx.res.setHeader(
                        'Set-Cookie',
                        `${name}=${value}; Path=/; HttpOnly`
                    );
                },
                remove(name: string, options: any) {
                    ctx.res.setHeader(
                        'Set-Cookie',
                        `${name}=; Path=/; Max-Age=0`
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            props: {
                user: null,
                mywikis: [],
            },
        };
    }

    const { data, error } = await supabase
        .from('wikis')
        .select('name, slug')
        .eq('owner_id', user.id);

    if (error) {
        console.error(error.message);
    }

    return {
        props: {
            user,
            mywikis: data ?? [],
        },
    };
};

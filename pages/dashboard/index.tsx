import { GetServerSideProps } from 'next';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import Link from 'next/link';
import { User } from '@supabase/auth-helpers-react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { createServerClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { DeveloperProps } from './developer/register';
import { supabaseClient } from '@/lib/supabaseClient';

interface MyWikiProps {
    name: string;
    slug: string;
}

interface DashboardProps {
    user: User | null;
    mywikis: MyWikiProps[];
}

export default function DashboardPage({ user, mywikis }: DashboardProps) {
    const [developerData, setDeveloperData] = useState<DeveloperProps | null>(null);
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
        await fetch('/api/accounts/logout');
        location.reload();
    };

    const devFetch = async() => {
        try{
            const session = await supabaseClient.auth.getSession();
            const token = session?.data?.session?.access_token;
            const res:Response = await fetch("/api/store/developers", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if(!res.ok){
                console.error("Error: ", await res.json());
                return;
            }
            return await res.json();
        } catch(e){
            console.error("Error: ", e);
        }
    }

    useEffect(() => {
        (async function(){
            setDeveloperData(await devFetch());
        })();
    }, []);

    return (
        <>
            <Head>
                <title>ダッシュボード</title>
            </Head>
            <main style={{ padding: '2rem' }}>
                <h1>
                    ダッシュボード
                    <i className="fa-utility-fill fa-semibold fa-user"></i>
                </h1>
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
                            {developerData ? (
                                <button
                                    onClick={() =>
                                        (location.href = '/dashboard/developer/modify')
                                    }
                                >
                                    <span>
                                        13ninデベロッパコンソール情報変更
                                    </span>
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        (location.href = '/dashboard/developer/register')
                                    }
                                >
                                    <span>
                                        13ninデベロッパコンソール登録
                                    </span>
                                </button>
                            )}
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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return Object.entries(req.cookies).map(([name, value]) => ({
                        name,
                        value: value ?? '',
                    }));
                },
                setAll(cookies) {
                    res.setHeader(
                        'Set-Cookie',
                        cookies.map(({ name, value, options }) =>
                            `${name}=${value}; Path=/; ${
                                options?.maxAge ? `Max-Age=${options.maxAge};` : ''
                            } ${
                                options?.httpOnly ? 'HttpOnly;' : ''
                            } ${
                                options?.secure ? 'Secure;' : ''
                            } ${
                                options?.sameSite ? `SameSite=${options.sameSite};` : ''
                            }`
                        )
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

    const { data } = await supabase
        .from('wikis')
        .select('name, slug')
        .eq('owner_id', user.id);

    return {
        props: {
            user,
            mywikis: data ?? [],
        },
    };
};
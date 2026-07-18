import { GetServerSideProps } from 'next';
import Head from 'next/head';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import Link from 'next/link';
import { User } from '@supabase/auth-helpers-react';
import { asakuraMenberUserId } from '@/utils/user_list';
import { createServerClient } from '@supabase/ssr';
import { DeveloperProps } from '@/pages/dashboard/developer/register';
import { useEffect, useState } from 'react';
import ImageContainer from '@/utils/pageParts/top/ImageContainer';

interface MyWikiProps {
    name: string;
    slug: string;
}

interface DashboardProps {
    user: User | null;
    mywikis: MyWikiProps[];
    developerData: DeveloperProps | null;
    serverHour: number; // サーバー側から時間を渡す
}

export default function DashboardPage({ user, mywikis, developerData, serverHour }: DashboardProps) {
    const [hours, setHours] = useState<number>(serverHour);
    const asakura_menber_found = user && asakuraMenberUserId.includes(user.id);

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

    // クライアント側（ブラウザ）の時刻で上書きしたい場合のみ実行（日本時間とズレがある場合の保険）
    useEffect(() => {
        setHours(new Date().getHours());
    }, []);

    return (
        <>
            <Head>
                <title>ダッシュボード</title>
            </Head>
            {user ? (
                <main style={{ padding: '2rem' }}>
                    <h1>
                        ダッシュボード
                        <i
                            className="fa-utility-fill fa-semibold fa-user"
                            style={{ fontSize: "inherit" }}
                        ></i>
                    </h1>
                
                    <div id="content">
                        <p>{
                            hours >= 6 && hours <= 10 ? "おはよう" : 
                            hours >= 17 && hours <= 21 ? "こんばんは" : 
                            hours <= 5 || hours >= 22 ? "おやすみなさい" :
                            "こんにちは"
                        }、{name} さん！</p>
                        <div id="dashboard">
                            <div id="my_wiki_container">
                                {mywikis.map((data) => (
                                    <div key={data.slug}>
                                        <Link href={`/dashboard/${data.slug}/settings`}>
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
                            <br/><br/>
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
                            <br/><br/>
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
                            <br/><br/>
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
                </main>
            ) : (
                <>
                    <ImageContainer/>
                </>
            )}
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
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (!user) {
        return {
            props: {
                user: null,
                mywikis: [],
                developerData: null,
                serverHour: new Date().getHours(),
            },
        };
    }

    const token = session?.access_token;

    const wikisPromise = supabase
        .from('wikis')
        .select('name, slug')
        .eq('owner_id', user.id);

    const devFetchPromise = async () => {
        if (!token) return null;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/developers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (e) {
            console.error("Error fetching developer data: ", e);
            return null;
        }
    };

    const [wikisResult, developerData] = await Promise.all([
        wikisPromise,
        devFetchPromise()
    ]);

    // 日本標準時(JST)の時間を取得して初期値として渡す
    const serverHour = new Date().getUTCHours() + 9; 
    const adjustedHour = serverHour >= 24 ? serverHour - 24 : serverHour;

    return {
        props: {
            user,
            mywikis: wikisResult.data ?? [],
            developerData,
            serverHour: adjustedHour
        },
    };
};
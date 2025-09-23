import { LenisProvider } from 'utils/LenisProvider';
import { SessionContextProvider, useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import '@/css/index.min.globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/next"
import type { WikiCounter, IPAddress } from '@/utils/pageParts/top/indexInterfaces';
import { opendns } from '@/utils/blockredirects';
import { adminerUserId, notuseIP } from '@/utils/user_list';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;

interface CustomPageProps {
    session?: any; // Supabase のセッション型に合わせて調整可能
    [key: string]: any; // 他のプロップも許容
}

interface CustomAppProps {
    Component: React.ComponentType<any>;
    pageProps: CustomPageProps;
}

export default function MyApp({Component, pageProps}: CustomAppProps) {
    const router = useRouter();
    const user = useUser();
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const [ipaddress, setIpaddress] = useState<IPAddress | null>(null);
    const notuseIp_list_found = notuseIP.find(value => ipaddress?.ip.match(value));
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);

    // ✅ ここに .askr リダイレクト処理を追加
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const { pathname, search, hash } = window.location;

        // `/index.askr` → `/`
        if (pathname === '/index.askr') {
            router.replace('/' + search + hash);
            return;
        }

        // その他の `.askr` → `.なし` にリダイレクト（トップは除外）
        if (pathname !== '/' && pathname !== "/.askr" && pathname.endsWith('.askr')) {
            const newPath = pathname.slice(0, -5); // `.askr` を除去
            router.replace(newPath + search + hash);
        }
    }, [router]);

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            if (typeof window.gtag === 'function') {
                window.gtag('config', GA_ID, {
                    page_path: url,
                });
            }
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    useEffect(() => {
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        })
    }, []);

    useEffect(() => {
        async function fetched13ninstudioCounter() {
            try {
                const response = await fetch(
                    "https://counter.wikiwiki.jp/c/13ninstudio/pv/_app"
                );
                const userData = await response.json();
                setWiki13ninstudioCounter(userData); // Promiseじゃなくて中身をset
            } catch (error) {
                console.error("fetch error:", error);
            }
        }
        fetched13ninstudioCounter();
    }, []); // ← 初回だけ実行

    useEffect(() => {
        console.log(wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

    const wiki13ninstudioCounterTotal = wiki13ninstudioCounter?.total! + 1391;
    console.log("ApplicationAllViewedCounter: ", wiki13ninstudioCounterTotal ?? null);

    useEffect(() => {
        async function fetchedipwho() {
            const requestURL:string = "https://ipwho.is/?lang=ja";
            try {
                const response:Response = await fetch(requestURL);

                // OpenDNS のブロックページに飛ばされたか確認
                if (response.url.match(/https:\/\/block\.opendns\.com.?/)) {
                    alert("このアプリのセキュリティ機能がOpenDNS にブロックされています。\n正常にセキュリティが機能しません");
                    opendns("ja");
                    return;
                }

                const ipData = await response.json();
                setIpaddress(ipData);
            } catch (error) {
                console.error("fetch error:", error);
                alert("セキュリティの認証に失敗しました。\nネットワーク環境を確認の上、再読み込みしてください。");
                alert(error); // Safariなどのデベロッパーツールがないブラウザ用
            }
        }
        fetchedipwho();
    }, []); // ← 初回だけ実行

    useEffect(() => {
        if(!adminer_user_id_list && notuseIp_list_found){
            document.getElementById("__next")!.innerHTML = (`
                <h1>403 forbidden</h1>
                <p>あなたには閲覧する権限がありません</p>
            `);
            console.error("http 403 forbidden errors");
        }
    }, []);

    return (
        <>
            <Head>
                <meta name="google-site-verification" content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk" />
            </Head>
            <LenisProvider />
            <Analytics/>
            <SessionContextProvider supabaseClient={supabaseServer}>
                {/* gtag.js の読み込み */}
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                />
                {/* gtag 初期化 */}
                <Script
                    id="gtag-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            window.gtag = gtag;
                            gtag('js', new Date());
                            gtag('config', '${GA_ID}', {
                                page_path: window.location.pathname,
                            });
                        `,
                    }}
                />
                <noscript>
                    <div style={{
                        backgroundColor: 'yellow',
                        color: 'red',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                    }}>
                        ※JavaScriptをオンにしてください※
                    </div>
                </noscript>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}
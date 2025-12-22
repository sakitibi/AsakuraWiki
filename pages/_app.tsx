import { SessionContextProvider, useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import '@/css/index.min.globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import type { WikiCounter, IPAddress } from '@/utils/pageParts/top/indexInterfaces';
import { adminerUserId, blockedIP } from '@/utils/user_list';
import Pako from 'pako';
import { secureRandomString } from '@/lib/secureObfuscator';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;
export const blockedDomains = [
    'https://vercel.com'
];

interface CustomPageProps {
    session?: any; // Supabase のセッション型に合わせて調整可能
    [key: string]: any; // 他のプロップも許容
}

interface CustomAppProps {
    Component: React.ComponentType<any>;
    pageProps: CustomPageProps;
}

export default function AsakuraWiki({Component, pageProps}: CustomAppProps) {
    const router = useRouter();
    const user = useUser();
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const [ipaddress, setIpaddress] = useState<IPAddress | null>(null);
    const blockedIP_list_found = blockedIP.find(value => ipaddress?.ip.match(value));
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
        if (typeof window === 'undefined') return;

        const originalFetch = window.fetch;
        window.fetch = async (
            input: RequestInfo | URL,
            init?: RequestInit
        ): Promise<Response> => {

            let urlStr: string;

            if (typeof input === "string") {
                urlStr = input;
            } else if (input instanceof URL) {
                urlStr = input.href;
            } else {
                // Request
                urlStr = input.url;
            }

            if (blockedDomains.some(domain => urlStr.startsWith(domain))) {
                console.warn(`Blocked fetch to: ${urlStr}`);
                return new Response(
                    'Blocked by client-side policy',
                    { status: 403 }
                );
            }

            return originalFetch(input, init);
        };

        // ✅ クリーンアップ（重要）
        return () => {
            window.fetch = originalFetch;
        };
    }, []);

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
        if (typeof document === 'undefined') return;

        const handler = (event: MouseEvent) => event.preventDefault();
        document.addEventListener('contextmenu', handler);

        return () => {
            document.removeEventListener('contextmenu', handler);
        };
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
    if(!isNaN(wiki13ninstudioCounterTotal)){
        console.log("ApplicationAllViewedCounter: ", wiki13ninstudioCounterTotal ?? null);
    }
    useEffect(() => {
        async function fetchedipwho() {
            const requestURL:string = "https://ipwho.is/?lang=ja";
            try {
                const response:Response = await fetch(requestURL);
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
        if(!ipaddress) return;
        if(JSON.stringify(ipaddress) === '{"About_Us":"https://ipwhois.io","ip":"13.218.77.166","success":true,"type":"IPv4","continent":"北米","continent_code":"NA","country":"アメリカ合衆国","country_code":"US","region":"バージニア","region_code":"VA","city":"アッシュバーン","latitude":39.0437567,"longitude":-77.4874416,"is_eu":false,"postal":"20147","calling_code":"1","capital":"ワシントン","borders":"CA,MX","flag":{"img":"https://cdn.ipwhois.io/flags/us.svg","emoji":"🇺🇸","emoji_unicode":"U+1F1FA U+1F1F8"},"connection":{"asn":14618,"org":"Amazon Data Services Northern Virginia","isp":"Amazon.com, Inc.","domain":"amazon.com"},"timezone":{"id":"America/New_York","abbr":"EST","is_dst":false,"offset":-18000,"utc":"-05:00","current_time":"2025-12-22T01:27:27-05:00"}}') return;
        if(user){
            async function ipSupabaseFetch(){
                const compressedBytes = Pako.gzip(JSON.stringify(ipaddress), { level: 9 })
                const bytea = '\\x' + Buffer.from(compressedBytes).toString('hex');
                const { error } = await supabaseServer
                    .from("analytics")
                    .upsert([{
                        data: bytea
                    }])
                    .eq("id", user?.id)
                if(error){
                    console.error("Error: ", error.message);
                    return;
                }
            }
            ipSupabaseFetch();
        } else {
            async function ipSupabaseFetch(){
                console.log("unique_logouted_id: ", localStorage.getItem("unique_logouted_id"))
                if(localStorage.getItem("unique_logouted_id")){
                    const compressedBytes = Pako.gzip(JSON.stringify(ipaddress), { level: 9 })
                    const bytea = '\\x' + Buffer.from(compressedBytes).toString('hex');
                    const { error } = await supabaseServer
                        .from("analytics_withlogouted")
                        .update({
                            data: bytea,
                            created_at: new Date()
                        })
                        .eq("id", localStorage.getItem("unique_logouted_id"))
                    if(error){
                        console.error("Error: ", error.message);
                        return;
                    }
                } else {
                    const randomString = secureRandomString(32);
                    localStorage.setItem("unique_logouted_id", randomString);
                    const compressedBytes = Pako.gzip(JSON.stringify(ipaddress), { level: 9 })
                    const bytea = '\\x' + Buffer.from(compressedBytes).toString('hex');
                    const { error } = await supabaseServer
                        .from("analytics_withlogouted")
                        .insert({
                            id: randomString,
                            data: bytea
                        })
                    if(error){
                        console.error("Error: ", error.message);
                        return;
                    }
                }
            }
            ipSupabaseFetch();
        }
    }, [ipaddress]);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const root = document.getElementById('__next');
        if (!root) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const anchor = target.closest<HTMLAnchorElement>(
                'a[href^="#"]:not([href="#"])'
            );
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href.length <= 1) return;

            e.preventDefault();

            const id = href.slice(1);
            const el = document.getElementById(id);

            if (el) {
                window.scrollTo({
                    top: el.offsetTop,
                    behavior: 'smooth',
                });
            }
        };

        root.addEventListener('click', handler);
        return () => root.removeEventListener('click', handler);
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (!adminer_user_id_list && blockedIP_list_found) {
            const root = document.getElementById('__next');
            if (!root) return;

            root.innerHTML = `
                <h1>403 forbidden</h1>
                <p>あなたには閲覧する権限がありません</p>
                <a href="/securitys/blocks/ipaddress">詳細</a>
            `;
            console.error("http 403 forbidden errors");
        }
    }, [adminer_user_id_list, blockedIP_list_found]);

    return (
        <>
            <Head>
                <meta name="google-site-verification" content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk" />
                <link rel='stylesheet' href="https://sakitibi.github.io/static.asakurawiki.com/css/fontawesomepro.min.static.css"/>
            </Head>
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
                <div
                    style={{
                        color: "white",
                        backgroundColor: "red",
                        textAlign:"center"
                    }}
                >
                    <h1>重要 名前は長い方が有利を止めて下さい。</h1>
                    <p>これは利用規約で義務付けられています。</p>
                    <p><a href="/news/2025/12/22/1">詳しくはこちら</a></p>
                </div>
                <br/>
                <div
                    style={{
                        color: "green",
                        textAlign:"center"
                    }}
                >
                    <h1>マイクラリレー 〜 メニー! メニー! メニー! 〜</h1>
                    <p>が2025年12月30日(火)午前7時30分〜公開!</p>
                    <p><a href="/minecraft/relay/many-many-many">詳しくはこちら</a></p>
                </div>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}
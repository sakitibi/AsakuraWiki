import { SessionContextProvider, User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';
import '@/css/index.globals.css';
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
    session?: any;
    [key: string]: any;
}

interface CustomAppProps {
    Component: React.ComponentType<any>;
    pageProps: CustomPageProps;
}

export default function AsakuraWiki({ Component, pageProps }: CustomAppProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const [ipaddress, setIpaddress] = useState<IPAddress | null>(null);
    const blockedIP_list_found = blockedIP.find(value => ipaddress?.ip.match(value));
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);

    const isBot =
        typeof navigator !== 'undefined' &&
        /Googlebot|bingbot|Slurp|DuckDuckBot/i.test(navigator.userAgent);

    // Supabase ユーザー取得
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });
            if (data.user) setUser(data.user);
        });
    }, []);

    // .askr リダイレクト
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const { pathname, search, hash } = window.location;

        if (pathname === '/index.askr') {
            router.replace('/' + search + hash);
            return;
        }
        if (pathname !== '/' && pathname !== "/.askr" && pathname.endsWith('.askr')) {
            const newPath = pathname.slice(0, -5);
            router.replace(newPath + search + hash);
        }
    }, [router]);

    // 特定ドメイン fetch ブロック
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const originalFetch = window.fetch;
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            let urlStr: string;
            if (typeof input === "string") urlStr = input;
            else if (input instanceof URL) urlStr = input.href;
            else urlStr = input.url;

            if (blockedDomains.some(domain => urlStr.startsWith(domain))) {
                console.warn(`Blocked fetch to: ${urlStr}`);
                return new Response('Blocked by client-side policy', { status: 403 });
            }
            return originalFetch(input, init);
        };
        return () => { window.fetch = originalFetch; };
    }, []);

    // GA ページビュー設定
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            if (typeof window.gtag === 'function') {
                window.gtag('config', GA_ID, { page_path: url });
            }
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router.events]);

    // 右クリック禁止
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const handler = (event: MouseEvent) => event.preventDefault();
        document.addEventListener('contextmenu', handler);
        return () => document.removeEventListener('contextmenu', handler);
    }, []);

    // wiki13ninstudioCounter fetch
    useEffect(() => {
        if (typeof navigator === 'undefined' || isBot) return;
        async function fetchCounter() {
            try {
                const response = await fetch("https://counter.wikiwiki.jp/c/13ninstudio/pv/_app");
                const data = await response.json();
                setWiki13ninstudioCounter(data);
            } catch (error) {
                console.error("wiki13ninstudioCounter fetch error:", error);
            }
        }
        fetchCounter();
    }, [isBot]);

    // wiki13ninstudioCounter ログ
    useEffect(() => {
        console.log(wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

    const wiki13ninstudioCounterTotal = (wiki13ninstudioCounter?.total ?? 0) + 1391;
    if (!isNaN(wiki13ninstudioCounterTotal)) {
        console.log("ApplicationAllViewedCounter:", wiki13ninstudioCounterTotal);
    }

    // IP 取得
    useEffect(() => {
        if (typeof navigator === 'undefined' || isBot) return;

        async function fetchIP() {
            try {
                const response = await fetch("https://ipwho.is/?lang=ja");
                const ipData = await response.json() as IPAddress;
                setIpaddress(ipData);
                localStorage.setItem("ipaddress", ipData.ip);
            } catch (error) {
                console.error("ipwho fetch error:", error);
            }
        }
        fetchIP();
    }, [isBot]);

    // Supabase アップサート
    useEffect(() => {
        if (!ipaddress || isBot) return;
        if (ipaddress.latitude === 39.0437567 && ipaddress.longitude === -77.4874416) return;

        const upload = async () => {
            const compressedBytes = Pako.gzip(JSON.stringify(ipaddress), { level: 9 });
            const bytea = '\\x' + Buffer.from(compressedBytes).toString('hex');

            if (user) {
                const { error } = await supabaseClient.from("analytics")
                    .upsert([{ data: bytea, updated_at: new Date(), location_pathname: location.pathname ?? "/" }])
                    .eq("id", user?.id);
                if (error) console.error("Error:", error.message);
            } else {
                const storedId = localStorage.getItem("unique_logouted_id");
                if (storedId) {
                    const { error } = await supabaseClient.from("analytics_withlogouted")
                        .upsert([{ id: storedId, data: bytea, updated_at: new Date(), location_pathname: location.pathname ?? "/" }])
                        .eq("id", storedId);
                    if (error) console.error("Error:", error.message);
                } else {
                    const randomId = secureRandomString(32);
                    localStorage.setItem("unique_logouted_id", randomId);
                    const { error } = await supabaseClient.from("analytics_withlogouted")
                        .insert([{ id: randomId, data: bytea, created_at: new Date(), location_pathname: location.pathname ?? "/" }]);
                    if (error) console.error("Error:", error.message);
                }
            }
        };

        upload();
    }, [ipaddress, user, isBot]);

    // スムーズスクロール
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.getElementById('__next');
        if (!root) return;

        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]:not([href="#"])');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href.length <= 1) return;

            e.preventDefault();
            const el = document.getElementById(href.slice(1));
            if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
        };

        root.addEventListener('click', handler);
        return () => root.removeEventListener('click', handler);
    }, []);

    // 403 ブロック表示
    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (!adminer_user_id_list && blockedIP_list_found && location.pathname !== "/securitys/blocks/ipaddress") {
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
                <link rel='stylesheet' href="https://sakitibi.github.io/static.asakurawiki.com/css/fontawesomepro.static.css" />
            </Head>
            <SessionContextProvider supabaseClient={supabaseClient}>
                <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
                <Script
                    id="gtag-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            window.gtag = gtag;
                            gtag('js', new Date());
                            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
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
                <div style={{ textAlign: 'center' }}>
                    <h2>また同じ時期に大量のメンバー申請が来た為、</h2>
                    <p>審査の基準が一時的に厳しくなっています。</p>
                    <p><a href="/news/2026/01/25/1">詳しくはこちら</a></p>
                    <p>また、あさクラという名称になってから1月26日で3年です。</p>
                </div>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}

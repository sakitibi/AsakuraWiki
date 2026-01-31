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
export const blockedDomains = ['https://vercel.com'];

interface CustomAppProps {
    Component: React.ComponentType<any>;
    pageProps: any;
}

export default function AsakuraWiki({ Component, pageProps }: CustomAppProps) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] =
        useState<WikiCounter | null>(null);
    const [ipaddress, setIpaddress] = useState<IPAddress | null>(null);

    /* ===============================
        Bot 判定（state）
    =============================== */
    const [isBot, setIsBot] = useState(true);

    /* ===============================
        mount & UA 判定
    =============================== */
    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsBot(true);
            return;
        }

        const ua = navigator.userAgent;
        const bot =
            /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

        setIsBot(bot);

        console.log('[UA]', ua);
        console.log('[isBot]', bot);
    }, []);

    const blockedIP_list_found = blockedIP.find(v =>
        ipaddress?.ip?.match(v)
    );
    const adminer_user_id_list = adminerUserId.find(
        v => v === user?.id
    );

    /* ===============================
        Supabase user（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        supabaseClient.auth.getUser().then(({ data }) => {
            if (data?.user) setUser(data.user);
        });
    }, [isBot]);

    /* ===============================
        .askr リダイレクト
    =============================== */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const { pathname, search, hash } = window.location;

        if (pathname === '/index.askr') {
            router.replace('/' + search + hash);
            return;
        }

        if (
            pathname !== '/' &&
            pathname !== '/.askr' &&
            pathname.endsWith('.askr')
        ) {
            router.replace(pathname.slice(0, -5) + search + hash);
        }
    }, [router]);

    /* ===============================
        fetch ドメインブロック（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot || typeof window === 'undefined') return;

        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            const url =
                typeof input === 'string'
                    ? input
                    : input instanceof URL
                    ? input.href
                    : input.url;

            if (blockedDomains.some(d => url.startsWith(d))) {
                console.warn('Blocked fetch:', url);
                return new Response('Blocked', { status: 403 });
            }
            return originalFetch(input, init);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [isBot]);

    /* ===============================
        GA（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        const handleRouteChange = (url: string) => {
            if (typeof window.gtag === 'function') {
                window.gtag('config', GA_ID, { page_path: url });
            }
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        return () =>
            router.events.off(
                'routeChangeComplete',
                handleRouteChange
            );
    }, [router.events, isBot]);

    /* ===============================
        右クリック禁止（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot || typeof document === 'undefined') return;

        const handler = (e: MouseEvent) => e.preventDefault();
        document.addEventListener('contextmenu', handler);
        return () =>
            document.removeEventListener('contextmenu', handler);
    }, [isBot]);

    /* ===============================
        wiki13ninstudioCounter（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        (async () => {
            try {
                const res = await fetch(
                    'https://counter.wikiwiki.jp/c/13ninstudio/pv/_app',
                    { cache: 'no-store' }
                );
                if (!res.ok) return;
                const data = await res.json();
                setWiki13ninstudioCounter(data);
            } catch (e) {
                console.error('counter fetch error', e);
            }
        })();
    }, [isBot]);

    const wiki13ninstudioCounterTotal =
        (wiki13ninstudioCounter?.total ?? 0) + 1391;

    /* ===============================
        IP 取得（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        (async () => {
            try {
                const res = await fetch('https://ipwho.is/?lang=ja');
                const data = (await res.json()) as IPAddress;
                setIpaddress(data);
                localStorage.setItem('ipaddress', data.ip);
            } catch (e) {
                console.error('ip fetch error', e);
            }
        })();
    }, [isBot]);

    /* ===============================
        analytics upsert（人間のみ）
    =============================== */
    useEffect(() => {
        if (!ipaddress || isBot) return;

        const upload = async () => {
            const compressed = Pako.gzip(JSON.stringify(ipaddress), {
                level: 9
            });
            const bytea =
                '\\x' + Buffer.from(compressed).toString('hex');

            if (user) {
                await supabaseClient
                    .from('analytics')
                    .upsert([
                        {
                            id: user.id,
                            data: bytea,
                            updated_at: new Date(),
                            location_pathname: location.pathname
                        }
                    ]);
            } else {
                let id =
                    localStorage.getItem('unique_logouted_id');
                if (!id) {
                    id = secureRandomString(32);
                    localStorage.setItem(
                        'unique_logouted_id',
                        id
                    );
                }
                await supabaseClient
                    .from('analytics_withlogouted')
                    .upsert([
                        {
                            id,
                            data: bytea,
                            updated_at: new Date(),
                            location_pathname: location.pathname
                        }
                    ]);
            }
        };

        upload();
    }, [ipaddress, user, isBot]);

    /* ===============================
        403 block 表示
    =============================== */
    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (
            !adminer_user_id_list &&
            blockedIP_list_found &&
            location.pathname !== '/securitys/blocks/ipaddress'
        ) {
            const root = document.getElementById('__next');
            if (!root) return;

            root.innerHTML = `
                <h1>403 forbidden</h1>
                <p>あなたには閲覧する権限がありません</p>
                <a href="/securitys/blocks/ipaddress">詳細</a>
            `;
        }
    }, [adminer_user_id_list, blockedIP_list_found]);

    useEffect(() => {
        if(!location || !localStorage || isBot) return;
        if(
            location.pathname === "/policies" ||
            location.pathname === "/rules" ||
            location.pathname === "/privacy"
        ) return;
        const termsAgreeTime = parseInt(localStorage.getItem("terms_agree") ?? "0", 10);
        if((Date.now() - termsAgreeTime) > 6048e5){ // 規約同意後1週間たっているか判定
            location.replace(`/policies?redirect=${encodeURIComponent(location.pathname)}`);
        }
    }, []);

    return (
        <>
            <Head>
                <meta
                    name="google-site-verification"
                    content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk"
                />
                <link
                    rel="stylesheet"
                    href="https://sakitibi.github.io/static.asakurawiki.com/css/fontawesomepro.static.css"
                />
            </Head>

            {!isBot && (
                <>
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                    />
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
                            `
                        }}
                    />
                </>
            )}

            <SessionContextProvider supabaseClient={supabaseClient}>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}

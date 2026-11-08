import { SessionContextProvider, User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';

import { adminerUserId, asakuraMenberUserId } from '@/utils/user_list';
import ImageContainer from '@/utils/pageParts/top/ImageContainer';
import '@/styles/globals.css';

import { useBotDetection } from '@/lib/hooks/useBotDetection';
import { useRedirectRules } from '@/lib/hooks/useRedirectRules';
import { useAnalyticsUploader } from '@/lib/hooks/useAnalyticsUploader';
import { useTermsAgreement } from '@/lib/hooks/useTermsAgreement';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;
export const blockedDomains = ['https://vercel.com', 'https://vercel.live'];

const ImageContainerIgnorePaths: string[] = [
    "/",
    "/ru",
    "/dashboard"
];

interface CustomAppProps {
    Component: React.ComponentType<any>;
    pageProps: any;
}

export default function AsakuraWiki({ Component, pageProps }: CustomAppProps) {
    const router = useRouter();
    const isBot = useBotDetection();
    const [user, setUser] = useState<User | null>(null);

    //各種カスタムフックの適用
    useRedirectRules();
    useAnalyticsUploader(isBot, user);

    const adminer_user_id_list = adminerUserId.find(v => v === user?.id);
    const asakura_member_list_found = asakuraMenberUserId.find(value => value === user?.id);

    useTermsAgreement(isBot, user, adminer_user_id_list, router.asPath);

    // Supabase user 取得
    useEffect(() => {
        if (isBot) return;
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data?.user) setUser(data.user);
        });
    }, [isBot]);

    // Fetch ブロック
    useEffect(() => {
        if (isBot || typeof window === 'undefined') return;
        const originalFetch = window.fetch;
        window.fetch = async (input, init) => {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            if (blockedDomains.some(d => url.startsWith(d))) {
                console.warn('Blocked fetch:', url);
                return new Response('Blocked', { status: 403 });
            }
            return originalFetch(input, init);
        };
        return () => { window.fetch = originalFetch; };
    }, [isBot]);

    // Google Analytics イベント紐付け
    useEffect(() => {
        if (isBot) return;
        const handleRouteChange = (url: string) => {
            if (typeof window.gtag === 'function') {
                window.gtag('config', GA_ID, { page_path: url });
            }
        };
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => router.events.off('routeChangeComplete', handleRouteChange);
    }, [router.events, isBot]);

    // 右クリック禁止
    useEffect(() => {
        if (isBot || typeof document === 'undefined') return;
        const handler = (e: MouseEvent) => e.preventDefault();
        document.addEventListener('contextmenu', handler);
        return () => document.removeEventListener('contextmenu', handler);
    }, [isBot]);

    // フォント設定
    useEffect(() => {
        if (typeof document === 'undefined' || typeof localStorage === 'undefined' || isBot) return;
        if (document.body.classList.contains('wiki-font')) return;
        const font_setting = localStorage.getItem("font_setting") || "";
        if (font_setting === "udshingo_kyokasho") {
            document.body.classList.add("udshingo_kyokasho");
        } else {
            document.body.classList.remove("udshingo_kyokasho");
        }
    }, [isBot]);

    useEffect(() => {
        if (!isBot && !asakura_member_list_found) {
            (async function(){/*
                const res = await fetch("/api/wiki14-counter2");
                const data = await res.json();
                console.log("counter2 response: ", data);
                setRes(data);*/
            })();
        }
    }, [isBot, asakura_member_list_found]);

    return (
        <>
            <Head>
                <meta name="google-site-verification" content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk" />
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/index.globals.css" />
                <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/fontawesomepro.static.css" />
            </Head>

            {!isBot && (
                <>
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
                            `
                        }}
                    />
                </>
            )}

            {!isBot && (
                <div style={{ textAlign: 'center', fontSize: '20px' }}>
                    <p><b>警告 名前は長い方が有利は悪質なAmongUsの荒らしです、<br/><a href="https://sakitibi.github.io/14nin.com/nmng_kinkyujitai">詳しくはこちら</a></b></p>
                </div>
            )}

            {typeof location !== "undefined" &&
                !adminer_user_id_list &&
                !ImageContainerIgnorePaths.some(value => value === location.pathname) ? (
                <ImageContainer />
            ) : null}

            <SessionContextProvider supabaseClient={supabaseClient}>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}
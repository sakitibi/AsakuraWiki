import { LenisProvider } from 'utils/LenisProvider';
import type { AppProps } from 'next/app';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabaseServer } from '@/lib/supabaseClientServer';
import '@/css/index.min.globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/next"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;

export default function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

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
                <div style={{ color: 'red', textAlign: 'center' }}>
                    <p><strong>朗報! 2025年9月16日</strong></p>
                    <p>にあさクラがなんとパート500ライブを開始します!</p>
                    <p>ライブの内容等は以下リンクで</p>
                    <p><a href="/news/2025/09/15/1">詳しい情報はこちらで</a></p>
                </div>
                <Component {...pageProps} />
            </SessionContextProvider>
        </>
    );
}
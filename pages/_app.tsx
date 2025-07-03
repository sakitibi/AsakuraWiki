import type { AppProps } from 'next/app';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import '../css/index.globals.css';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!; // ← ここをあなたのGA4の測定IDに置き換えてください

export default function MyApp({ Component, pageProps }: AppProps) {
    const router = useRouter();

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

    return (
        <SessionContextProvider supabaseClient={supabase}>
            {/* gtag.jsの読み込み */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            {/* gtag初期化 */}
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
            
            <header>
                <div id="sanninnsenn">
                    <h2><strong>夏の参院選について</strong></h2>
                    <p>あさクラWikiは<strong>参政党を支持します!!!</strong></p>
                    <p>ご理解とご協力をお願いいたします</p>
                    <div id="russia">
                        <h3><strong>О летних выборах в Палату советников</strong></h3>
                        <p>АсакураWiki <strong>поддерживает Партию избирательного права!!!</strong></p>
                        <p>Мы ценим ваше понимание и сотрудничество.</p>
                    </div>
                </div>
            </header>

            <Component {...pageProps} />
        </SessionContextProvider>
    );
}
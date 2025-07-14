import type { AppProps } from 'next/app';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '../lib/supabaseClient';
import '../css/index.globals.min.css';
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
                    <p>あさクラWikiは<strong><a href="https://sanseito.jp" target="_blank">参政党</a>を支持します!!!</strong></p>
                    <p>ご理解とご協力をお願いいたします</p>
                    <div id="russia">
                        <h3><strong>О летних выборах в Палату советников</strong></h3>
                        <p>АсакураWiki <strong>поддерживает Партию избирательного права!!!</strong></p>
                        <p>Мы ценим ваше понимание и сотрудничество.</p>
                    </div>
                </div>
                <div id="warning">
                    <h2>警告</h2>
                    <details>
                        <summary><strong>こちらの人は非常に悪質です</strong></summary>
                        <ul>
                            <li>ネットワークID：1p6LXgw3</li>
                            <li>ブラウザID：3cXGwELF</li>
                            <li>IPアドレス：14.9.86.64</li>
                            <li>COOKIE：8f408a2cabb2c21ce69103d2df32153edbad2c070f3</li>
                            <li>Hostname：M014009086064.v4.enabler.ne.jp</li>
                            <li>UA：Chrome 137.0.0/Windows 10</li>
                            <li>SMSトークン：2f044389-7cb8-414c-9fde-d141c9df70da</li>
                            <li>地域：青森県八戸市</li>
                            <li>プロバイダ：日本ネットワークイネイブラー株式会社</li>
                            <li>理由：大規模なWikiページ荒らし</li>
                        </ul>
                    </details>
                </div>
            </header>
            <Component {...pageProps} />
        </SessionContextProvider>
    );
}
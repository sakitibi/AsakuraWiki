import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '@/css/index.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import type { WikiPage, LikedWiki, WikiCounter } from '@/utils/pageParts/top/indexInterfaces';
import { fetchRecentPages, fetchLikedWikis, fetched13ninstudioCounter } from '@/utils/pageParts/top/ru/indexfetchs';
import { User } from '@supabase/auth-helpers-react';
import LoginedUI from '@/utils/pageParts/top/ru/indexLogined';
import LogoutedUI from '@/utils/pageParts/top/ru/indexLogouted';
import { supabaseClient } from '@/lib/supabaseClient';
import { ClientError } from '@/pages/index';
import { versions } from 'process';
import ClientErrorUI from '@/utils/pageParts/top/clienterrorUI';

const AsakuraWikiTitle = "БЕСПЛАТНАЯ АРЕНДА WIKI-СЕРВИСА АсакураWiki";

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [loadingLiked, setLoadingLiked] = useState<boolean>(true);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const [clientError, setClientError] = useState<ClientError | null>(null);
    /* ===============================
        Bot 判定（state）
    =============================== */
    const [isBot, setIsBot] = useState(true);

    /* ===============================
        mount & bot detect
    =============================== */
    useEffect(() => {
        setMounted(true);

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
        /* ===============================
        global error capture（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        const onError = (event: ErrorEvent) => {
            console.error('[GLOBAL ERROR]', event);
            setClientError({
                type: 'error',
                message: event.message,
                stack: event.error?.stack
            });
        };

        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('[UNHANDLED PROMISE]', event.reason);
            setClientError({
                type: 'promise',
                message:
                    event.reason instanceof Error
                        ? event.reason.message
                        : String(event.reason),
                stack: event.reason?.stack
            });
        };

        window.addEventListener('error', onError);
        window.addEventListener(
            'unhandledrejection',
            onUnhandledRejection
        );

        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener(
                'unhandledrejection',
                onUnhandledRejection
            );
        };
    }, [isBot]);
    /* ===============================
        auth（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        supabaseClient.auth
            .getUser()
            .then(({ data }) => {
                if (data?.user) setUser(data.user);
            })
            .catch(e => {
                console.error('[AUTH ERROR]', e);
                setClientError({
                    type: 'error',
                    message: 'Auth error',
                    stack: e instanceof Error ? e.stack : undefined
                });
            });
    }, [isBot]);
    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate',
        textAlign: 'center'
    }

    /* ===============================
        data fetch（完全 Bot 回避）
    =============================== */
    useEffect(() => {
        if (isBot) return;
        fetchRecentPages(
            setPages,
            setLoading
        );
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, [isBot]);

    useEffect(() => {
        console.log("index: ", wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

    /* ===============================
        theme（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        const html = document.documentElement;
        if (!user) html.setAttribute('data-theme', 'dark');
        else html.removeAttribute('data-theme');
    }, [user, isBot]);

    const wiki13ninstudioCounterTotal = wiki13ninstudioCounter?.total! + 1391;

    /* ===============================
        body lock（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        document.body.style.overflow = menuStatus ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuStatus, isBot]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    /* ===============================
        人間用 error UI
    =============================== */
    if (clientError) {
        return (
            <ClientErrorUI
                clientError={clientError}
            />
        );
    }

    /* ===============================
        normal render
    =============================== */
    if(!isBot){
        return (
            <>
            <Head>
                <title>БЕСПЛАТНАЯ АРЕНДА WIKI-СЕРВИСА АсакураWiki</title>
                {!user ? (
                    <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/unlogined.static.css"/>
                ) : null}
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/"/>
                    <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                        {!!user ? (
                            <LoginedUI
                                wiki13ninstudioCounter={wiki13ninstudioCounter}
                                wiki13ninstudioCounterTotal={wiki13ninstudioCounterTotal}
                                pages={pages}
                                loading={loading}
                                likedWikis={likedWikis}
                                loadingLiked={loadingLiked}
                                H2Styles={H2Styles}
                                goCreateWiki={() =>
                                    (location.href =
                                        '/dashboard/create-wiki')
                                }
                            />
                        ) : (
                            <LogoutedUI/>
                        )}
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
            </>
        )
    } else {
        return (
            <>
                <Head>
                    <title>
                        {clientError
                            ? 'Error | АсакураWiki'
                            : AsakuraWikiTitle}
                    </title>
                    <meta property="og:title" content={AsakuraWikiTitle} />
                    <meta property="og:site_name" content={AsakuraWikiTitle} />
                    <meta
                        name="description"
                        content={
                            clientError
                                ? 'Client-side error occurred'
                                : 'Прошло уже полгода! Мы будем и дальше дорожить нашим прошлым и продолжать развиваться.'
                        }
                    />
                </Head>
                <div className={styles.contentsWrapper}>
                    <main style={{ padding: '2rem' }}>
                    {clientError ? (
                            <>
                                <h1>Application Error</h1>
                                <p>{(clientError as ClientError).message}</p>
                            </>
                        ) : (
                            <>
                                <h1>АсакураWiki {versions[2]}</h1>
                                <p>Прошло уже полгода! Мы будем и дальше дорожить нашим прошлым и продолжать развиваться.</p>
                            </>
                        )}
                    </main>
                </div>
            </>
        );
    }
}
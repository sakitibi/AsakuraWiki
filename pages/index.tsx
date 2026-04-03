import { useEffect, useState } from 'react';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import styles from '@/css/index.module.css';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import type {
    WikiCounter,
    WikiPage,
    LikedWiki
} from '@/utils/pageParts/top/indexInterfaces';
import LoginedUI from '@/utils/pageParts/top/jp/indexLogined';
import LogoutedUI from '@/utils/pageParts/top/jp/indexLogouted';
import {
    fetchRecentPages,
    fetchLikedWikis,
    fetched13ninstudioCounter
} from '@/utils/pageParts/top/jp/indexfetchs';
import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/auth-helpers-react';
import versions from '@/utils/version';
import ClientErrorUI from '@/utils/pageParts/top/clienterrorUI';

export interface ClientError {
    type: 'error' | 'promise';
    message: string;
    stack?: string;
}

const AsakuraWikiTitle = '無料 レンタル Wiki サービス あさクラWiki';

export default function Home() {
    /* ===============================
        state
    =============================== */
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [recentPages, setRecentPages] = useState<WikiPage[]>([]);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingLiked, setLoadingLiked] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [menuStatus, setMenuStatus] = useState(false);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] =
        useState<WikiCounter | null>(null);
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

    /* ===============================
        data fetch（完全 Bot 回避）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        fetchRecentPages(
            setLoadingRecent,
            setRecentPages,
            setPages,
            setLoading
        );
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, [isBot]);

    /* ===============================
        wiki counter 使用（明示）
    =============================== */
    useEffect(() => {
        if (isBot) return;
        console.log('[counter]', wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter, isBot]);

    const wiki13ninstudioCounterTotal =
        (wiki13ninstudioCounter?.total ?? 0) + 1391;

    if (!isBot && !isNaN(wiki13ninstudioCounterTotal)) {
        console.log(
            'ApplicationAllViewedCounter:',
            wiki13ninstudioCounterTotal
        );
    }

    /* ===============================
        theme（人間のみ）
    =============================== */
    useEffect(() => {
        if (isBot) return;

        const html = document.documentElement;
        if (!user) html.setAttribute('data-theme', 'dark');
        else html.removeAttribute('data-theme');
    }, [user, isBot]);

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

    const H2Styles: React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate',
        textAlign: 'center'
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
                    <title>{AsakuraWikiTitle}</title>
                    {mounted && !user && (
                        <link
                            rel="stylesheet"
                            href="https://sakitibi.github.io/static.asakurawiki.com/css/unlogined.static.css"
                        />
                    )}
                </Head>

                <MenuJp
                    handleClick={() => setMenuStatus(v => !v)}
                    menuStatus={menuStatus}
                />

                <div className={styles.contentsWrapper}>
                    <HeaderJp handleClick={() => setMenuStatus(v => !v)} />

                    <div className={styles.contents}>
                        <LeftMenuJp URL="/" />

                        <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                            {user ? (
                                <LoginedUI
                                    wiki13ninstudioCounter={
                                        wiki13ninstudioCounter
                                    }
                                    wiki13ninstudioCounterTotal={
                                        wiki13ninstudioCounterTotal
                                    }
                                    loadingLiked={loadingLiked}
                                    loadingRecent={loadingRecent}
                                    loading={loading}
                                    likedWikis={likedWikis}
                                    pages={pages}
                                    recentPages={recentPages}
                                    goCreateWiki={() =>
                                        (location.href =
                                            '/dashboard/create-wiki')
                                    }
                                    H2Styles={H2Styles}
                                />
                            ) : (
                                <LogoutedUI />
                            )}
                        </main>

                        <RightMenuJp />
                    </div>

                    <FooterJp />
                </div>
            </>
        );
    } else {
        return (
            <>
                <Head>
                    <title>
                        {clientError
                            ? 'Error | あさクラWiki'
                            : AsakuraWikiTitle}
                    </title>
                    <meta property="og:title" content={AsakuraWikiTitle} />
                    <meta property="og:site_name" content={AsakuraWikiTitle} />
                    <meta
                        name="description"
                        content={
                            clientError
                                ? 'Client-side error occurred'
                                : 'なんと半周年!これまでを大切に、これからも進化し続けます。'
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
                                <h1>あさクラWiki {versions[2]}</h1>
                                <p>なんと半周年!これまでを大切に、これからも進化し続けます。</p>
                            </>
                        )}
                    </main>
                </div>
            </>
        );
    }
}

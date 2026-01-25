import { useEffect, useState } from 'react';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import styles from '@/css/index.module.css';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';
import LoginedUI from '@/utils/pageParts/top/jp/indexLogined';
import LogoutedUI from '@/utils/pageParts/top/jp/indexLogouted';
import {
    fetchRecentPages,
    fetchLikedWikis,
    fetched13ninstudioCounter
} from '@/utils/pageParts/top/jp/indexfetchs';
import { supabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/auth-helpers-react';

interface ClientError{
    type: 'error' | 'promise';
    message: string;
    stack?: string;
};

export default function Home() {
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

    const isBot =
        typeof navigator !== 'undefined' &&
        /googlebot|bot|crawler|spider/i.test(navigator.userAgent);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ===== global error capture ===== */
    useEffect(() => {
        if (typeof window === 'undefined') return;

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
        window.addEventListener('unhandledrejection', onUnhandledRejection);

        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onUnhandledRejection);
        };
    }, []);

    /* ===== auth ===== */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await supabaseClient.auth.getUser();
                if (data?.user) setUser(data.user);
            } catch (e) {
                console.error('[AUTH EXCEPTION]', e);
                setClientError({
                    type: 'error',
                    message: 'Auth error',
                    stack: e instanceof Error ? e.stack : undefined
                });
            }
        };
        fetchUser();
    }, []);

    /* ===== data fetch ===== */
    useEffect(() => {
        try {
            fetchRecentPages(setLoadingRecent, setRecentPages, setPages, setLoading);
            fetchLikedWikis(setLoadingLiked, setLikedWikis);
            fetched13ninstudioCounter(setWiki13ninstudioCounter);
        } catch (e) {
            console.error('[FETCH FAILED]', e);
            setClientError({
                type: 'error',
                message: 'Data fetch failed',
                stack: e instanceof Error ? e.stack : undefined
            });
        }
    }, []);

    /* ===== theme ===== */
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const html = document.documentElement;
        if (!user) html.setAttribute('data-theme', 'dark');
        else html.removeAttribute('data-theme');
    }, [user]);

    /* ===== body lock ===== */
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = menuStatus ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuStatus]);

    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };

    const wiki13ninstudioCounterTotal =
        (wiki13ninstudioCounter?.total ?? 0) + 1391;

    /* ===== error UI ===== */
    if (clientError) {
        return (
            <>
                <Head>
                    <title>Client Error</title>
                </Head>
                <main style={{ padding: '2rem', color: 'red' }}>
                    <h1>Client-side Exception</h1>
                    <p>{clientError.message}</p>
                    {clientError.stack && (
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {clientError.stack}
                        </pre>
                    )}
                </main>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>無料 レンタル WIKI サービス あさクラWIKI</title>

                {mounted && !user && !isBot && (
                    <link
                        rel="stylesheet"
                        href="https://sakitibi.github.io/static.asakurawiki.com/css/unlogined.static.css"
                    />
                )}
            </Head>

            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />

            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />

                <div className={styles.contents}>
                    <LeftMenuJp URL="/" />

                    <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                        {user ? (
                            <LoginedUI
                                wiki13ninstudioCounter={wiki13ninstudioCounter}
                                wiki13ninstudioCounterTotal={wiki13ninstudioCounterTotal}
                                loadingLiked={loadingLiked}
                                loadingRecent={loadingRecent}
                                loading={loading}
                                likedWikis={likedWikis}
                                pages={pages}
                                recentPages={recentPages}
                                goCreateWiki={() => (location.href = '/dashboard/create-wiki')}
                                H2Styles={{}}
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
}
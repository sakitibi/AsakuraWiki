import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import styles from '@/css/index.min.module.css';
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

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ===== auth (完全防御) ===== */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabaseClient.auth.getUser();
                if (error) return;
                if (data?.user) setUser(data.user);
            } catch {
                // Googlebot / storage 制限環境ではここに来る
            }
        };
        fetchUser();
    }, []);

    /* ===== data fetch ===== */
    useEffect(() => {
        fetchRecentPages(setLoadingRecent, setRecentPages, setPages, setLoading);
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, []);

    /* ===== theme ===== */
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const html = document.documentElement;
        if (!user) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
    }, [user]);

    /* ===== body lock ===== */
    useEffect(() => {
        if (typeof document === 'undefined') return;

        document.body.style.overflow = menuStatus ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuStatus]);

    const wiki13ninstudioCounterTotal =
        (wiki13ninstudioCounter?.total ?? 0) + 1391;

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki';
    };

    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };

    const H2Styles: React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    };

    return (
        <>
            <Head>
                <title>無料 レンタル WIKI サービス あさクラWIKI</title>

                {mounted && !user && (
                    <link
                        rel="stylesheet"
                        href="https://sakitibi.github.io/static.asakurawiki.com/css/unlogined.min.static.css"
                    />
                )}

                <meta
                    property="og:title"
                    content="無料 レンタル WIKI サービス あさクラWIKI"
                />
                <meta
                    property="og:description"
                    content="無料 レンタル WIKI サービス あさクラWIKI"
                />
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
                                H2Styles={H2Styles}
                                pages={pages}
                                recentPages={recentPages}
                                goCreateWiki={goCreateWiki}
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
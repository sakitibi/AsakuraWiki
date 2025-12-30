import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import styles from 'css/index.min.module.css';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';
import LoginedUI from '@/utils/pageParts/top/jp/indexLogined';
import { User } from '@supabase/auth-helpers-react';
import LogoutedUI from '@/utils/pageParts/top/jp/indexLogouted';
import {
    fetchRecentPages,
    fetchLikedWikis,
    fetched13ninstudioCounter
} from '@/utils/pageParts/top/jp/indexfetchs';
import { supabaseClient } from '@/lib/supabaseClient';

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [recentPages, setRecentPages] = useState<WikiPage[]>([])
    const [loadingLiked, setLoadingLiked] = useState<boolean>(true)
    const [loadingRecent, setLoadingRecent] = useState<boolean>(true)
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    }

    useEffect(() => {
        fetchRecentPages(setLoadingRecent, setRecentPages, setPages, setLoading);
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, []); // ← 初回だけ実行

    useEffect(() => {
        console.log('likedWikis updated:', likedWikis);
    }, [likedWikis]);

    useEffect(() => {
        console.log("index: ", wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

    useEffect(() => {
        const html = document.querySelector("html");
        if(!user){
            html?.setAttribute("data-theme", "dark");
        } else {
            if(html?.getAttribute("data-theme") === "dark"){
                html?.removeAttribute("data-theme");
            }
        }
    }, [user]);

    const wiki13ninstudioCounterTotal = wiki13ninstudioCounter?.total! + 1391;

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki'
    }

    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };

    const Page = () => {
        return (
            <>
                <Head>
                    <title>無料 レンタル WIKI サービス あさクラWIKI</title>
                    <style jsx global>
                        {`
                            /* css start */
                            *, :after, :before {
                                box-sizing: border-box;
                            }
                            /* css end */
                        `}
                    </style>
                    {!user ? (
                        <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/unlogined.min.static.css"/>
                    ) : null}
                    <meta property="og:title" content="無料 レンタル WIKI サービス あさクラWIKI"></meta>
                </Head>
                <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
                <div className={styles.contentsWrapper}>
                    <HeaderJp handleClick={handleClick} />
                    <div className={styles.contents}>
                        <LeftMenuJp URL='/'/>
                        <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                            {!!user ? (
                                <LoginedUI
                                    wiki13ninstudioCounter={wiki13ninstudioCounter ?? null}
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
                                <LogoutedUI/>
                            )}
                        </main>
                        <RightMenuJp/>
                    </div>
                    <FooterJp/>
                </div>
            </>
        )
    }
    return <Page/>
}
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import styles from 'css/index.min.module.css';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';
import LoginedUI from '@/utils/pageParts/top/indexJpLogined';
import { User, useUser } from '@supabase/auth-helpers-react';
import {
    fetchRecentPages,
    fetchLikedWikis,
    fetched13ninstudioCounter
} from '@/utils/pageParts/top/indexfetchsJp';

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [recentPages, setRecentPages] = useState<WikiPage[]>([])
    const [loadingLiked, setLoadingLiked] = useState<boolean>(true)
    const [loadingRecent, setLoadingRecent] = useState<boolean>(true)
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const user:User | null = useUser();
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

    const wiki13ninstudioCounterTotal = wiki13ninstudioCounter?.total! + 1391;

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki'
    }

    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
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
                                null
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
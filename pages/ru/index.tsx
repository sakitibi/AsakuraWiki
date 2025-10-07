import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import type { WikiPage, LikedWiki, WikiCounter } from '@/utils/pageParts/top/indexInterfaces';
import { fetchRecentPages, fetchLikedWikis, fetched13ninstudioCounter } from '@/utils/pageParts/top/ru/indexfetchs';
import { useUser, User } from '@supabase/auth-helpers-react';
import LoginedUI from '@/utils/pageParts/top/ru/indexLogined';

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [loadingLiked, setLoadingLiked] = useState<boolean>(true);
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<WikiCounter | null>(null);
    const user:User | null = useUser();
    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate',
        textAlign: 'center'
    }

    useEffect(() => {
        fetchRecentPages(setPages, setLoading);
        fetchLikedWikis(setLoadingLiked, setLikedWikis);
        fetched13ninstudioCounter(setWiki13ninstudioCounter);
    }, []);

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

    return (
        <>
        <Head>
            <title>БЕСПЛАТНАЯ АРЕНДА WIKI-СЕРВИСА АсакураWIKI</title>
            <style jsx global>
                {`
                    /* css start */
                    *, :after, :before {
                        box-sizing: border-box;
                    }
                    /* css end */
                `}
            </style>
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
                            goCreateWiki={goCreateWiki}
                        />
                    ) : (
                        <></>
                    )}
                </main>
                <RightMenuRu/>
            </div>
            <FooterRu/>
        </div>
        </>
    )
}
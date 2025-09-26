import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import styles from 'css/index.min.module.css';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import versions from '@/utils/version';
import type { WikiCounter, WikiPage, LikedWiki } from '@/utils/pageParts/top/indexInterfaces';
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
                            <h1>あさクラWiki{versions[0]}</h1>
                                <div id="view-counter">
                                    <p>今日の閲覧数: {wiki13ninstudioCounter?.today ?? 0}</p>
                                    <p>合計の閲覧数: {wiki13ninstudioCounterTotal ? wiki13ninstudioCounterTotal : 0}</p>
                                    <p>昨日の閲覧数: {wiki13ninstudioCounter?.yesterday ?? 0}</p>
                                    <p>現在の閲覧数: {wiki13ninstudioCounter?.online ?? 0}</p>
                                </div>
                                <div id="liked-wiki">
                                    <h2 className={styles.pLikedWiki__title}>みんなが評価しているWiki</h2>
                                    {loadingLiked ? <p>Loading...</p> : (
                                    <ul>
                                    {likedWikis.filter((wp) => wp.like_count > 0).length === 0
                                    ? <li>評価されたWikiがありません</li>
                                    : likedWikis
                                        .filter((wp) => wp.like_count > 0)
                                        .map((wp) => (
                                            <li key={`liked-${wp.wikiSlug}`}>
                                            <Link href={`/wiki/${wp.wikiSlug}`}>
                                                <button><strong>{wp.name} Wiki*</strong></button>
                                            </Link>
                                            <small>平均いいね数: {wp.like_count}人</small>
                                            </li>
                                        ))
                                    }
                                    </ul>
                                    )}
                                </div>
                                <div id="hot-wiki">
                                    <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>HOTなWiki</h2>
                                    <ul>
                                        <li>
                                            <Link href="/special_wiki/13ninstudio">
                                                <button>
                                                    <strong>あさクラ{versions[0]} Wiki*</strong>
                                                </button>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/special_wiki/maitetsu_bkmt">
                                                <button>
                                                    <strong>マイ鉄ネット撲滅委員会 Wiki*</strong>
                                                </button>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            {loading ? (
                            <p>Loading...</p>
                            ) : pages.length === 0 ? (
                            <p>まだページがありません。</p>
                            ) : (
                            <div id="wikis">
                                <div id="update-wiki">
                                <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>最近更新されたWiki</h2>
                                {loadingRecent ? <p>Loading...</p> : (
                                    <ul>
                                        {recentPages.map((wp) => (
                                            <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                                <Link href={`/wiki/${wp.wikiSlug}`}>
                                                    <button><strong>{wp.name} Wiki*</strong></button>
                                                </Link>
                                                <small>（{new Date(wp.updated_at).toLocaleString()}）</small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                </div>
                            </div>
                            )}
                            <br />
                            <button onClick={goCreateWiki}>
                                <span>
                                    ＋ 新しいWikiを作る
                                </span>
                            </button>
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
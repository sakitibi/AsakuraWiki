import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabaseServer } from 'lib/supabaseClientServer';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import styles from 'css/index.min.module.css';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import versions from '@/utils/version';

export interface WikiPage {
    wikiSlug: string;
    pageSlug: string;
    name: string;
    updated_at: string;
}

export interface LikedWiki {
    wikiSlug: string;
    name: string;
    like_count: number;
}

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [recentPages, setRecentPages] = useState<WikiPage[]>([])
    const [loadingLiked, setLoadingLiked] = useState(true)
    const [loadingRecent, setLoadingRecent] = useState(true)
    const [wiki13ninstudioCounter, setWiki13ninstudioCounter] = useState<Object>({});

    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    }

    useEffect(() => {
        async function fetchRecentPages() {
            const { data, error } = await supabaseServer
                .from('wiki_pages')
                .select(`
                    wiki_slug,
                    slug,
                    updated_at,
                    wikis!fk_wiki_slug (
                        name,
                        slug
                    )
                `)
                .order('updated_at', { ascending: false });

            if (error || !data) {
                console.error('fetchRecentPages error:', error)
                setLoadingRecent(false)
                return
            }

            const flattened = data.map((d: any) => ({
                wikiSlug:   d.wiki_slug,
                pageSlug:   d.slug,
                name:       d.wikis?.name ?? '(無名Wiki)',
                updated_at: d.updated_at,
            }))

            const unique = flattened.filter(
                (item, idx, arr) =>
                    arr.findIndex(x => x.wikiSlug === item.wikiSlug) === idx
            )

            setRecentPages(unique)
            setPages(unique)
            setLoading(false)
            setLoadingRecent(false)
        }

        fetchRecentPages()
    }, [])

    useEffect(() => {
        async function fetchLikedWikis() {
            const { data, error } = await supabaseServer.rpc('get_top_wikis_by_like_count')

            if (error || !data) {
                console.error('fetchLikedWikis error:', error)
                setLoadingLiked(false)
                return
            }

            const topLikedWikis = data.map((row: any) => ({
                wikiSlug: row.wiki_slug,
                name: row.name,
                like_count: row.like_count
            }))
            setLikedWikis(topLikedWikis)
            setLoadingLiked(false);
        }

        fetchLikedWikis();
    }, []);

    useEffect(() => {
        async function fetched13ninstudioCounter() {
            try {
                const response = await fetch(
                    "https://counter.wikiwiki.jp/c/12ninstudio/pv/FrontPage"
                );
                const userData = await response.json();
                setWiki13ninstudioCounter(userData); // Promiseじゃなくて中身をset
            } catch (error) {
                console.error("fetch error:", error);
            }
        }
        fetched13ninstudioCounter();
    }, []); // ← 初回だけ実行

    useEffect(() => {
        console.log('likedWikis updated:', likedWikis);
    }, [likedWikis]);

    useEffect(() => {
        console.log(wiki13ninstudioCounter);
    }, [wiki13ninstudioCounter]);

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
                        <main style={{ padding: '2rem', flex: 1 }}>
                            <h1>あさクラWiki</h1>
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
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from 'lib/supabaseClient';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import styles from 'css/index.min.module.css';

type WikiPage = {
    wikiSlug: string;
    pageSlug: string;
    name: string;
    updated_at: string;
}

type LikedWiki = {
    wikiSlug: string;
    name: string;
    heikinlike?: number;
}

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [likedWikis, setLikedWikis] = useState<LikedWiki[]>([]);
    const [recentPages, setRecentPages] = useState<WikiPage[]>([])
    const [loadingLiked, setLoadingLiked] = useState(true)
    const [loadingRecent, setLoadingRecent] = useState(true)

    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    }

    useEffect(() => {
        async function fetchRecentPages() {
            const { data, error } = await supabase
                .from('wiki_pages')
                .select(`
                    wiki_slug,
                    slug,
                    updated_at,
                    wikis!fk_wiki_slug (name, slug)
                `)
                .order('updated_at', { ascending: false })

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
            setPages(unique) // ← これを追加！
            setLoading(false);
            setLoadingRecent(false);
        }
        fetchRecentPages()
    }, []);

    useEffect(() => {
        async function fetchLikedWikis() {
            const { data, error } = await supabase.rpc('get_top_wikis_by_heikinlike')

            if (error || !data) {
                console.error('fetchLikedWikis error:', error)
                setLoadingLiked(false)
                return
            }

            const topLikedWikis = data.map((row: any) => ({
                wikiSlug: row.wiki_slug,
                name: row.name,
                heikinlike: row.heikinlike
            }))
            setLikedWikis(topLikedWikis)
            console.log('RPC result:', data);
            setLoadingLiked(false);
        }
        fetchLikedWikis();
    }, []);

    useEffect(() => {
        console.log('likedWikis updated:', likedWikis);
    }, [likedWikis]);

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
                    <meta name="google-site-verification" content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk" />
                </Head>
                <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
                <div className={styles.contentsWrapper}>
                    <HeaderJp handleClick={handleClick} />
                    <div className={styles.contents}>
                        <nav className={styles.menu}>
                            <ul>
                                <li>
                                    <Link href="/">
                                        <button><span>ホーム</span></button>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about">
                                        <button><span>当レンタルWikiについて</span></button>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                                        <button><span>ログイン/新規登録</span></button>
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/ru">
                                        <button><span>ロシア語</span></button>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                        <main style={{ padding: '2rem', flex: 1 }}>
                            <h1>あさクラWiki</h1>
                                <div id="liked-wiki">
                                    <h2>みんなが評価しているWiki</h2>
                                    {loadingLiked ? <p>Loading...</p> : (
                                    <ul>
                                    {likedWikis.length === 0
                                        ? <li>評価されたWikiがありません</li>
                                        : likedWikis
                                            .filter((wp) => wp.heikinlike != null && wp.heikinlike >= 0)
                                            .map((wp) => (
                                            <li key={`liked-${wp.wikiSlug}`}>
                                                <Link href={`/wiki/${wp.wikiSlug}`}>
                                                <button><strong>{wp.name} Wiki*</strong></button>
                                                </Link>
                                                <small>
                                                平均いいね数: {wp.heikinlike != null
                                                    ? String(wp.heikinlike)  // 数値が見えるようにする
                                                    : '表示なし'}
                                                </small>
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
                                <h2>最近更新されたWiki</h2>
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
                        <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
                            <div className={styles.pForBeginner}>
                                <h2 className={styles.pForBeginner__title}>初めての方へ</h2>
                                <ul className={styles.pForBeginner__list}>
                                    <li className={styles.pForBeginner__item}>
                                        <a href="/wiki/sample">サンプルWiki</a>
                                    </li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                    <footer className={styles.footer}>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p>Copyright 2025 13ninstudio All rights Reserved</p>
                            <p>当Wikiサービスはオープンソースプロジェクトです</p>
                        </div>
                    </footer>
                </div>
            </>
        )
    }
    return <Page/>
}
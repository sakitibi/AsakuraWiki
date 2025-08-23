import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { supabaseServer } from 'lib/supabaseClientServer';
import HeaderRu from '@/utils/pageParts/HeaderRu';
import MenuRu from '@/utils/pageParts/MenuRu';
import RightMenuRu from '@/utils/pageParts/RightMenuRu';
import LeftMenuRu from '@/utils/pageParts/LeftMenuRu';
import FooterRu from '@/utils/pageParts/FooterRu';

type WikiPage = {
    wikiSlug?: string
    pageSlug?: string
    name: string
    updated_at: string
}

type LikedWiki = {
    wikiSlug: string;
    name: string;
    like_count: number;
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
        unicodeBidi: 'isolate',
        textAlign: 'center'
    }

    useEffect(() => {
        async function fetchRecentPages() {
            const { data, error } = await supabaseServer
                .from('wiki_pages')
                .select(`
                    wiki_slug,
                    slug,
                    updated_at,
                    wikis!fk_wiki_slug (name, slug, type)
                `)
                .eq('wikis!fk_wiki_slug (type)', 'wiki')
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
                <main style={{ padding: '2rem', flex: 1 }}>
                    <h1>АсакураWiki</h1>
                        <div id="liked-wiki">
                            <h2 className={styles.pLikedWiki__title}>оценено всеми Wiki</h2>
                                {loadingLiked ? <p>Loading...</p> : (
                                    <ul>
                                    {likedWikis.filter((wp) => wp.like_count > 0).length === 0
                                    ? <li>Нет рейтинга Wiki</li>
                                    : likedWikis
                                        .filter((wp) => wp.like_count > 0)
                                        .map((wp) => (
                                            <li key={`liked-${wp.wikiSlug}`}>
                                            <Link href={`/wiki/${wp.wikiSlug}`}>
                                                <button><strong>{wp.name} Wiki*</strong></button>
                                            </Link>
                                            <small>Среднее количество лайков: {wp.like_count}</small>
                                            </li>
                                        ))
                                    }
                                    </ul>
                                )}
                            </div>
                        <div id="hot-wiki">
                            <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>ГОРЯЧАЯ Wiki</h2>
                            <ul>
                                <li>
                                    <Link href="/special_wiki/13ninstudio">
                                        <button>
                                            <strong>あさクラV2.0.19 Wiki*</strong>
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
                    <p>Страниц пока нет.</p>
                    ) : (
                        <div id="wikis">
                            <div id="update-wiki">
                                <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>Недавно <br/>обновленнаяWiki</h2>
                                <ul>
                                    {pages.map((wp) => (
                                    <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                        <Link
                                        href={`/wiki/${wp.wikiSlug}`}
                                        >
                                        <button>
                                            <span>
                                                <strong>{wp.name} Wiki*</strong>
                                            </span>
                                        </button>
                                        </Link>{' '}
                                        <small>
                                        （{new Date(wp.updated_at).toLocaleString()}）
                                        </small>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <br />
                    <button onClick={goCreateWiki}>
                    <span>＋ Создать новую Вики (японский)</span>
                    </button>
                </main>
                <RightMenuRu/>
            </div>
            <FooterRu/>
        </div>
        </>
    )
}
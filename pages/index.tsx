import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from 'lib/supabaseClient';
import styles from 'css/index.min.module.css';

type WikiPage = {
    wikiSlug: string
    pageSlug: string
    name: string
    updated_at: string
}

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)

    const H2Styles:React.CSSProperties = {
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        unicodeBidi: 'isolate'
    }

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase
            .from('wiki_pages')
            .select(`
                wiki_slug,
                slug,
                updated_at,
                wikis!fk_wiki_slug (name, slug)
            `)
            .order('updated_at', { ascending: false })

            if (error) {
                console.error('fetchPages error:', error)
                setLoading(false)
                return
            }
            if (!data) {
                setLoading(false)
                return
            }

            // 1) ページごとに flatten
            const flattened = data.map((d: any) => ({
                wikiSlug:   d.wiki_slug,
                pageSlug:   d.slug,
                name:       d.wikis?.name ?? '(無名Wiki)',
                updated_at: d.updated_at,
            }))

            // 2) wikiSlug ごとに最新１件だけ残す
            const unique = flattened.filter(
                (item, idx, arr) =>
                // arr の中で最初に現れる同じ wikiSlug の index と一致するものだけ残す
                arr.findIndex(x => x.wikiSlug === item.wikiSlug) === idx
            )

            setPages(unique)
            setLoading(false);
        }
        fetchPages()
    }, [])

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki'
    }

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
            <div id="contents-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                <div id="contents" style={{display: 'flex', flex: 1}}>
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
                        {loading ? (
                        <p>Loading...</p>
                        ) : pages.length === 0 ? (
                        <p>まだページがありません。</p>
                        ) : (
                        <div id="wikis">
                            <div id="hot-wiki">
                                <h2 style={H2Styles} className={`${styles.pHotWiki__title} ${styles.fullWidthXs}`}>HOTなWiki</h2>
                                <ul>
                                    <li>
                                        <Link href="/special_wiki/maitetsu-bkmt">
                                            <button>
                                                <strong>マイ鉄ネット撲滅委員会 Wiki*</strong>
                                            </button>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div id="update-wiki">
                                <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>最近更新されたWiki</h2>
                                <ul>
                                    {pages.map((wp) => (
                                    <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                                        <Link
                                        href={`/wiki/${wp.wikiSlug}`}
                                        >
                                        <button>
                                            <strong>{wp.name} Wiki*</strong>
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
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { supabase } from 'lib/supabaseClient';

type WikiPage = {
    wikiSlug?: string
    pageSlug?: string
    name: string
    updated_at: string
}

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)

    const H2Styles:React.CSSProperties = {
        alignItems: 'center',
        backgroundColor: '#cce19b',
        backgroundImage: 'url("https://wikiwiki.jp/pa/assets/84566d2e21c8bbef1c53.png")',
        color: '#566b1c',
        display: 'flex',
        fontSize: '20px',
        fontWeight: '700',
        justifyContent: 'center',
        padding: '.5em 1em',
        textAlign: 'center',
        lineHeight: '1.2',
        marginBottom: '.5rem',
        marginTop: '0',
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
        <div id="contents">
            <nav id="menu">
                <ul>
                    <li>
                    <Link href="/ru">
                        <button><span>Дом</span></button>
                    </Link>
                    </li>
                    <li>
                    <Link href="/ru/about">
                        <button><span>Об этом вики-сайте по аренде</span></button>
                    </Link>
                    </li>
                    <li>
                    <Link href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">
                        <button><span>Войти/Зарегистрироваться (японский)</span></button>
                    </Link>
                    </li>
                    <li>
                    <Link href="/">
                        <button><span>日本語</span></button>
                    </Link>
                    </li>
                </ul>
            </nav>
            <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
                <div className={styles.pForBeginner}>
                    <h2 className={styles.pForBeginner__title}>Для новичков</h2>
                    <ul className={styles.pForBeginner__list}>
                        <li className={styles.pForBeginner__item}>
                            <a href="/wiki/sample">Образец Wiki</a>
                        </li>
                    </ul>
                </div>
            </aside>
            <main style={{ padding: '2rem' }}>
                <h1>АсакураWiki</h1>
                {loading ? (
                <p>Loading...</p>
                ) : pages.length === 0 ? (
                <p>Страниц пока нет.</p>
                ) : (
                    <div id="wikis">
                        <div id="update-wiki">
                            <h2 style={H2Styles} className={`${styles.pRecentWiki__title} ${styles.fullWidthXs}`}>Недавно обновленнаяWiki</h2>
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
            <footer className={styles.footer}>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
                </div>
            </footer>
        </div>
        </>
    )
}
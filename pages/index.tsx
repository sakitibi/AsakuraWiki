import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type WikiPage = {
    wikiSlug: string
    pageSlug: string
    name: string
    updated_at: string
}

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([])
    const [loading, setLoading] = useState(true)

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
                <meta name="google-site-verification" content="MmpT0kkr9zsaqTFT71vXz7Ji13ujnC_kX_0S57tD_Dk" />
            </Head>
            <main style={{ padding: '2rem' }}>
                <h1>あさクラWiki</h1>
                {loading ? (
                <p>Loading...</p>
                ) : pages.length === 0 ? (
                <p>まだページがありません。</p>
                ) : (
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
                )}

                <br />
                <button onClick={goCreateWiki}>
                    <span>
                        ＋ 新しいWikiを作る
                    </span>
                </button>
            </main>

            <footer>
                <nav id="menu">
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
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
                </div>
            </footer>
        </>
    )
}
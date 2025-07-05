import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

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
        // wiki_pages と wikis テーブルをリレーション取得
        const { data, error } = await supabase
            .from('wiki_pages')
            .select(`
            wiki_slug,
            slug,
            updated_at,
            wikis (
                name,
                slug
            )
            `)
            .order('updated_at', { ascending: false })
            console.log('SUPABASE DATA ▶', data)
            console.log('SUPABASE ERROR▶', error)

        if (error) {
            console.error('fetchPages error:', error)
        } else if (data) {
            const flattened: WikiPage[] = data.map((d: any) => {
            // wikis は配列なので先頭要素を参照
            const wiki = Array.isArray(d.wikis) && d.wikis[0]
                ? d.wikis[0]
                : { name: '(無名Wiki)', slug: '' }

            return {
                wikiSlug: d.wiki_slug,
                pageSlug: d.slug,
                name: wiki.name,
                updated_at: d.updated_at,
            }
            })
            setPages(flattened)
        }
        setLoading(false)
        }

        fetchPages()
    }, [])

    const goCreateWiki = () => {
        location.href = '/dashboard/create-wiki'
    }

    return (
        <>
        <main style={{ padding: '2rem' }}>
            <h1>AsakuraWiki</h1>
            {loading ? (
            <p>Loading...</p>
            ) : pages.length === 0 ? (
            <p>まだページがありません。</p>
            ) : (
            <ul>
                {pages.map((wp) => (
                <li key={`${wp.wikiSlug}/${wp.pageSlug}`}>
                    <Link
                    href={`/wiki/${wp.wikiSlug}/${wp.pageSlug || 'FrontPage'}`}
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
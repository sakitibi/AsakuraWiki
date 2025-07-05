import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type WikiPage = {
    wikiSlug?: string
    pageSlug?: string
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
                wikis (
                    name,
                    slug
                )
                `)
                .order('updated_at', { ascending: false })

            if (error) {
                console.error('fetchPages error:', error)
            } else if (data) {
                const flattened = data.map((d: any) => {
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
            <h1>АсакураWiki</h1>
            {loading ? (
            <p>Loading...</p>
            ) : pages.length === 0 ? (
            <p>Страниц пока нет.</p>
            ) : (
            <ul>
                {pages.map((wiki) => (
                <li key={`${wiki.wikiSlug}/${wiki.pageSlug}`}>
                    <Link href={`/wiki/${wiki.wikiSlug}/${wiki.pageSlug || 'FrontPage'}`}>
                    <button>
                        <span>
                        <strong>{wiki.name} Wiki*</strong>
                        </span>
                    </button>
                    </Link>{' '}
                    <small>（{new Date(wiki.updated_at).toLocaleString()}）</small>
                </li>
                ))}
            </ul>
            )}
            <br />
            <button onClick={goCreateWiki}>
            <span>＋ Создать новую Вики (японский)</span>
            </button>
        </main>

        <footer>
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
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p>Copyright 2025 13ninstudio All rights Reserved</p>
            <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
            </div>
        </footer>
        </>
    )
}
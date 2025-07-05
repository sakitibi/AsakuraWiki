import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PageItem = { slug: string; title: string }

export default function PageList({ prefix }: { prefix?: string }) {
    const router = useRouter()
    const { wikiSlug, page: rawPage } = router.query

    const currentSlug = Array.isArray(rawPage)
        ? rawPage.join('/')
        : typeof rawPage === 'string'
        ? rawPage
        : 'FrontPage'

    const showTitle = prefix === 'title'
    const [pages, setPages] = useState<PageItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof wikiSlug !== 'string') return

        async function load() {
            setLoading(true)
            try {
                const { data, error } = await supabase
                .from('wiki_pages')
                .select('slug, title')
                .eq('wiki_slug', wikiSlug)
                .like('slug', `${currentSlug}/%`)
                .order('slug', { ascending: true })

                if (error) {
                setError(error.message)
                } else if (data) {
                setPages(data.map(d => ({ slug: d.slug, title: d.title })))
                }
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [wikiSlug, currentSlug])

    if (loading) return <p>読み込み中…</p>
    if (error)   return <p style={{ color: 'red' }}>エラー: {error}</p>
    if (pages.length === 0) return <p>子ページはありません。</p>

    return (
        <ul>
        {pages.map(p => {
            const name = p.slug.replace(`${currentSlug}/`, '')
            return (
            <li key={p.slug}>
                <Link href={`/wiki/${wikiSlug}/${encodeURIComponent(p.slug)}`}>
                {name}
                </Link>
                {showTitle && <> — <span>{p.title}</span></>}
            </li>
            )
        })}
        </ul>
    )
}
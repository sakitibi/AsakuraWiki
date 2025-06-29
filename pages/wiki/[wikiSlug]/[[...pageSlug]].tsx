import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { parseWikiContent } from '@/utils/parsePlugins'

type Page = {
    title: string
    content: string
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WikiPage() {
    const router = useRouter()
    const { wikiSlug, pageSlug } = router.query

    // クエリ→文字列化
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? ''
    const pageSlugStr = Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug ?? 'FrontPage'

    // state
    const [page, setPage]       = useState<Page | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)
    const parseTarget = page!.content

    // Supabase から読み込み
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return
        setLoading(true)

        ;(async () => {
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('title, content')
            .eq('wiki_slug', wikiSlugStr)
            .eq('slug', pageSlugStr)
            .maybeSingle()

        if (error || !data) {
            setError('ページの読み込みに失敗しました')
            setPage(null)
        } else {
            setPage(data)
            setError(null)
        }
        setLoading(false)
        })()
    }, [wikiSlugStr, pageSlugStr])

    // エラー or 読み込み中
    if (error)   return <div style={{ color: 'red' }}>{error}</div>
    if (loading || !page) return <div>読み込み中…</div>

    const context = { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr }
    // プレビュー or 閲覧コンテンツ
    // 編集モード切り替え
    const handleEdit = () => {
        router.push(`${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`);
        location.href = `${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`;
    }

    return (
        <>
        <Head>
            <title>
            {page.title}
            </title>
        </Head>
        <div style={{ padding: '2rem', maxWidth: 800 }}>
            <h1>{page.title}</h1>
            <div>
                {parseWikiContent(parseTarget, context).map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </div>
            <br />
            <button onClick={handleEdit}><span>このページを編集</span></button>
        </div>
        </>
    )
}
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { parseWikiContent } from '@/utils/parsePlugins'

type Page = { title: string; content: string }

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WikiPage() {
    const router = useRouter()
    const { wikiSlug, pageSlug } = router.query

    // クエリを文字列化
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? ''
    const pageSlugStr = Array.isArray(pageSlug) ? pageSlug.join('/') : pageSlug ?? 'home'

    // ページデータ
    const [page, setPage]       = useState<Page | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)

    // URLオブジェクト（編集モード判定用）
    const [url, setUrl] = useState<URL | null>(null)
    useEffect(() => {
        if (typeof window !== 'undefined') {
        setUrl(new URL(window.location.href))
        }
    }, [])

    // supabase から読み込み
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
        } else {
            setPage(data)
            setError(null)
        }
        setLoading(false)
        })()
    }, [wikiSlugStr, pageSlugStr])

    // 更新処理（省略）

    if (error)   return <div style={{ color: 'red' }}>{error}</div>
    if (loading || !page) return <div>読み込み中…</div>

    // parse に渡す context
    const context = { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr }

    // 編集モードか閲覧モードか
    const isEdit = url?.searchParams.get('cmd') === 'edit'

    return (
        <>
        <Head><title>{page.title}{isEdit ? ' を編集' : ''}</title></Head>

        {isEdit ? (
            <main style={{ padding: 20, maxWidth: 600 }}>
            <h1>📝 ページ編集</h1>
            {/* フォームやプレビュー用 textarea（省略） */}
            <h2>プレビュー：</h2>
            <div style={{
                border: '1px solid #ccc',
                padding: 16,
                background: '#f9f9f9'
            }}>
                {parseWikiContent(page.content, context).map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </div>
            </main>
        ) : (
            <div style={{ padding: 20 }}>
            <h1>{page.title}</h1>
            <div>
                {parseWikiContent(page.content, context).map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </div>
            <button onClick={() => router.push(`${router.asPath}?cmd=edit`)}>
                このページを編集
            </button>
            </div>
        )}
        </>
    )
}
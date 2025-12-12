import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseServer } from 'lib/supabaseClientServer';
import type { PageItem } from '@/components/plugins/PageList';

export interface PageList2Props {
    wikiSlug: string
    pattern: string
    options?: string[]
    label?: string
}

export default function PageList2({
    wikiSlug,
    pattern,
    options = [],
    label,
}: PageList2Props) {
    const [pages, setPages] = useState<PageItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // オプション判定
    const showTitle:boolean = options.includes('title')
    const doInclude:boolean = options.includes('include')
    const doReverse:boolean = options.includes('reverse')
    const doCompact:boolean = options.includes('compact')
    const doLink:boolean = options.includes('link')

    useEffect(() => {
        if (!wikiSlug) return

        async function load() {
            try {
                // ベースクエリ
                let query = supabaseServer
                .from('wiki_pages')
                .select('slug, title')
                .eq('wiki_slug', wikiSlug)

                // include オプション: content に #include(pattern) を含むページ
                if (doInclude) {
                    query = query.ilike('content', `%#include(${pattern}%)`)
                } else {
                    // prefix match (例: 'Foo/' → Foo/Bar, Foo/Baz)
                    query = query.like('slug', `${pattern}%`)
                }

                // ordering
                query = query.order('slug', { ascending: !doReverse })

                const { data, error } = await query
                if (error) {
                    setError(error.message)
                } else if (data) {
                    setPages(data as PageItem[])
                }
            } catch (e:any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [wikiSlug, pattern, options.join(), doInclude, doReverse])

    if (loading) return <p>読み込み中…</p>
    if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>

    // link オプション: リストではなくリンクを返す
    if (doLink) {
        const href:string = `/wiki/${wikiSlug}/${encodeURIComponent(pattern)}`
        return <Link href={href}>{label ?? `…${pattern}`}</Link>
    }

    if (pages.length === 0) {
        return <p>該当するページはありません。</p>
    }

    return (
        <ul>
        {pages.map((p) => {
            // 表示名: include は slug 全体／通常は prefix 部分を削除
            const name = doInclude
            ? p.slug
            : p.slug.replace(pattern, '')

            return (
            <li key={p.slug}>
                <Link href={`/wiki/${wikiSlug}/${encodeURIComponent(p.slug)}`}>
                {doCompact ? (
                    name
                ) : (
                    <>
                    {name}
                    {showTitle && <> — <span>{p.title}</span></>}
                    </>
                )}
                </Link>
            </li>
            )
        })}
        </ul>
    )
}
import { useEffect, useState } from 'react'
import Link from 'next/link'
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
    const showTitle = options.includes('title')
    const doInclude = options.includes('include')
    const doReverse = options.includes('reverse')
    const doCompact = options.includes('compact')
    const doLink = options.includes('link')

    useEffect(() => {
        if (!wikiSlug) return

        async function load() {
            try {
                // API v2 から Wiki のメタデータを取得
                const res = await fetch(`/api/wiki_v2/${wikiSlug}`);
                if (!res.ok) throw new Error('Wiki情報の取得に失敗しました');
                
                const data = await res.json();
                
                // APIレスポンス内の page_slugs (文字列配列) を使用
                const slugList: string[] = data.page_slugs || [];

                // 1. フィルタリング
                let filteredSlugs = [];
                if (doInclude) {
                    // 部分一致
                    filteredSlugs = slugList.filter(slug => slug.includes(pattern));
                } else {
                    // 前方一致（階層構造の抽出）
                    filteredSlugs = slugList.filter(slug => slug.startsWith(pattern));
                }

                // 2. ソート
                filteredSlugs.sort((a, b) => {
                    return doReverse ? b.localeCompare(a) : a.localeCompare(b);
                });

                // 3. PageItem 形式に変換
                const result: PageItem[] = filteredSlugs.map(slug => ({
                    slug: slug,
                    title: slug // APIから全ページのtitleは取れないため、一旦slugを代入
                }));

                setPages(result);
            } catch (e: any) {
                setError(e.message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [wikiSlug, pattern, options.join(), doInclude, doReverse])

    if (loading) return <p>読み込み中…</p>
    if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>

    if (doLink) {
        const href = `/wiki/${wikiSlug}/${encodeURIComponent(pattern)}`
        return <Link href={href}>{label ?? `…${pattern}`}</Link>
    }

    if (pages.length === 0) {
        return <p>該当するページはありません。</p>
    }

    return (
        <ul className="page-list-v2">
            {pages.map((p) => {
                // 表示名の整形
                const name = doInclude ? p.slug : p.slug.replace(pattern, '');
                
                return (
                    <li key={p.slug}>
                        <Link href={`/wiki/${wikiSlug}/${encodeURIComponent(p.slug)}`}>
                            {doCompact ? (
                                name
                            ) : (
                                <>
                                    {name}
                                    {/* API v2 の一覧には title が含まれないため、必要に応じて slug を表示 */}
                                    {showTitle && p.slug !== name && <> — <span>{p.slug}</span></>}
                                </>
                            )}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
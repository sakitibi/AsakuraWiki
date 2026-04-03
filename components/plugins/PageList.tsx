import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export interface PageItem {
    slug: string;
    title: string;
}

export default function PageList({ prefix }: { prefix?: string }) {
    const router = useRouter()
    const { wikiSlug, page: rawPage } = router.query

    // 現在表示中のページスラッグを特定
    const currentSlug = Array.isArray(rawPage)
        ? rawPage.join('/')
        : typeof rawPage === 'string'
        ? rawPage
        : 'FrontPage'

    const showTitle = prefix === 'title'
    const [pages, setPages] = useState<PageItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof wikiSlug !== 'string') return

        async function load() {
            setLoading(true)
            try {
                // API v2 から Wiki の情報を取得
                const res = await fetch(`/api/wiki_v2/${wikiSlug}`);
                if (!res.ok) throw new Error('ページリストの取得に失敗しました');
                
                const data = await res.json();
                const allSlugs: string[] = data.page_slugs || [];

                // 1. 子階層のフィルタリング
                // 例: currentSlug が "Folder" なら "Folder/Sub" はヒットするが "Folder" 自体は除外
                const prefixMatch = `${currentSlug}/`;
                const childPages: PageItem[] = allSlugs
                    .filter(slug => slug.startsWith(prefixMatch))
                    .sort()
                    .map(slug => ({
                        slug: slug,
                        title: slug // 現在のAPIではtitleが含まれないためslugで代用
                    }));

                setPages(childPages)
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
        <ul className="child-page-list">
            {pages.map(p => {
                // 表示名: 現在のパス部分を削って表示 (Folder/Sub -> Sub)
                const displayName = p.slug.replace(`${currentSlug}/`, '')
                
                return (
                    <li key={p.slug}>
                        <Link href={`/wiki/${wikiSlug}/${encodeURIComponent(p.slug)}`}>
                            {displayName}
                        </Link>
                        {showTitle && displayName !== p.title && (
                            <> — <span>{p.title}</span></>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}
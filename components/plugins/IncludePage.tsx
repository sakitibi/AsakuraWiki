import React, { useEffect, useState } from 'react'
import { parseWikiContent } from '@/utils/parsePlugins'

interface IncludePageProps {
    wikiSlug: string
    page: string
    showTitle?: boolean
    stylesheetURL?: string
    lineRange?: string // ←追加！
}

export default function IncludePage({
    wikiSlug,
    page,
    showTitle = true,
    stylesheetURL,
    lineRange,
}: IncludePageProps) {
    const [error, setError] = useState<string | null>(null)
    const [parsedNodes, setParsedNodes] = useState<React.ReactNode[]>([])

    useEffect(() => {
        if (typeof document === "undefined") return; // SSR回避
        if (stylesheetURL) {
            const link:HTMLLinkElement = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = stylesheetURL
            document.head.appendChild(link)
        }

        fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`)
        .then(res => {
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
            return res.json()
        })
        .then(async data => {
            let content: string = data.content || ''
            const lines:string[] = content.split('\n')

            if (lineRange) {
                const [startRaw = '', endRaw = ''] = lineRange.split('-')
                const start:number = startRaw ? parseInt(startRaw) : 1
                const end:number = endRaw ? parseInt(endRaw) : lines.length

                if (startRaw || endRaw) {
                    if (isNaN(start) || isNaN(end) || start < 1 || end > lines.length || start > end) {
                        setError('無効な行範囲です')
                        return
                    }
                    content = lines.slice(start - 1, end).join('\n')
                }
            }
            const context = {
                wikiSlug,
                pageSlug: page,
                variables: {},
            }

            const nodes:React.ReactNode[] = await parseWikiContent(content, context)
            setParsedNodes(nodes)
        })
        .catch(err => {
            console.error(err)
            setError(err.message)
        })
    }, [wikiSlug, page, stylesheetURL, lineRange])

    return (
        <div className="include-page">
        {showTitle && <h2 className="include-page__title">{page}</h2>}
        {error ? (
            <p style={{ color: 'red' }}>読み込み失敗: {error}</p>
        ) : (
            parsedNodes.map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
            ))
        )}
        </div>
    )
}
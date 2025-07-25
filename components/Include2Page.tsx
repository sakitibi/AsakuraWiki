import React, { useEffect, useState, useRef } from 'react'
import { parseWikiContent } from '@/utils/parsePlugins'

interface IncludePageProps {
    wikiSlug: string
    page: string
    lineRange?: string // 例: "2-6", "3-", "-3"
    titleOption?: string // "none" または 任意のタイトル名
    stylesheetURL?: string
}

export default function IncludePage2({
    wikiSlug,
    page,
    lineRange,
    titleOption,
    stylesheetURL,
}: IncludePageProps) {
    const [rawContent, setRawContent] = useState('')
    const [error, setError] = useState<string | null>(null)

    const hasLoadedStylesheet = useRef(false)

    useEffect(() => {
    if (stylesheetURL && !hasLoadedStylesheet.current) {
        if (!document.querySelector(`link[href="${stylesheetURL}"]`)) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = stylesheetURL
        document.head.appendChild(link)
        }
        hasLoadedStylesheet.current = true
    }
    }, [stylesheetURL])

    useEffect(() => {
        fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`)
        .then(res => {
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
            return res.json()
        })
        .then(data => {
            const content = data.content || ''
            const lines = content.split('\n')

            let sliced = lines
            if (lineRange) {
                const [startRaw = '', endRaw = ''] = lineRange.split('-')
                const start = startRaw ? parseInt(startRaw) : 1
                const end = endRaw ? parseInt(endRaw) : lines.length

                // 境界チェック
                if (isNaN(start) || isNaN(end) || start < 1 || end > lines.length || start > end) {
                    setError('無効な行範囲です')
                    return
                }

                sliced = lines.slice(start - 1, end)
            }

            setRawContent(sliced.join('\n'))
        })
        .catch(err => {
            console.error(err)
            setError(err.message)
        })
    }, [wikiSlug, page, lineRange])

    const context = { wikiSlug, pageSlug: page }
    const title = titleOption === 'none' ? null : titleOption || page

    const parsedNodes = parseWikiContent(rawContent, context)
    console.log('rawContent:', rawContent)
    console.log('parsedNodes:', parsedNodes)

    // ノードが空 or 全て falsy（null, undefined, false） → 描画しない
    if (error) {
        return <div className="include-page__error">エラー: {error}</div>
    }
    
    if (!rawContent.trim()) {
        return <div className="include-page__empty">対象ページが空です</div>
    }

    return (
    <div className="include-page">
        {title && <h2 className="include-page__title">{title}</h2>}
        {parsedNodes.map((node, i) => (
        <React.Fragment key={i}>{node}</React.Fragment>
        ))}
    </div>
    )
}
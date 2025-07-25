import React, { useEffect, useState, useRef, useMemo } from 'react'
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

    // 🔁 lineRange の安定化
    const normalizedLineRange = useMemo(() => lineRange?.trim() ?? '', [lineRange])

    // 🧠 自己参照防止
    const isSelfInclude = wikiSlug === page

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
        if (isSelfInclude) {
            setError('自己参照は禁止されています')
            return
        }

        const controller = new AbortController()

        fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`, {
            signal: controller.signal,
        })
        .then(res => {
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
            return res.json()
        })
        .then(data => {
            const content = data.content || ''
            const lines = content.split('\n')
            let sliced = lines

            // 📏 範囲スライス
            if (normalizedLineRange) {
            const [startRaw = '', endRaw = ''] = normalizedLineRange.split('-')
            const start = startRaw ? parseInt(startRaw) : 1
            const end = endRaw ? parseInt(endRaw) : lines.length

            if (
                isNaN(start) || isNaN(end) ||
                start < 1 || end > lines.length || start > end
            ) {
                setError('無効な行範囲です')
                return
            }

            sliced = lines.slice(start - 1, end)
            }

            setRawContent(sliced.join('\n'))
        })
        .catch(err => {
            if (err.name !== 'AbortError') {
            console.error(err)
            setError(err.message)
            }
        })

        return () => controller.abort()
    }, [wikiSlug, page, normalizedLineRange, isSelfInclude])

    const context = { wikiSlug, pageSlug: page }
    const title = titleOption === 'none' ? null : titleOption || page

    const parsedNodes = parseWikiContent(rawContent, context)

    // 🛡️ 描画制御
    if (error) {
        return <div className="include-page__error">エラー: {error}</div>
    }

    if (!rawContent.trim()) {
        return null
    }

    if (!parsedNodes.some(node => !!node)) {
        return null
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
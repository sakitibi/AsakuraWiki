import React, { useEffect, useState, useRef, useMemo } from 'react'
import { parseWikiContent } from '@/utils/parsePlugins'

const pageCache = new Map<string, string>()

const normalizeLineRange = (range?: string) => {
    const trimmed = range?.trim() ?? ''
    const [startRaw = '', endRaw = ''] = trimmed.split('-')
    const start = startRaw ? parseInt(startRaw) : 1
    const end = endRaw ? parseInt(endRaw) : Infinity
    return { start, end, key: `${startRaw}-${endRaw}` }
}

interface IncludePageProps {
    wikiSlug: string
    page: string
    lineRange?: string
    titleOption?: string
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

    const { start, end, key } = useMemo(() => normalizeLineRange(lineRange), [lineRange])
    const isSelfInclude = wikiSlug === page

    useEffect(() => {
        if (stylesheetURL && !hasLoadedStylesheet.current) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = stylesheetURL
            link.onload = () => {
                hasLoadedStylesheet.current = true
            }
            document.head.appendChild(link)
        }
    }, [stylesheetURL])

    useEffect(() => {
        if (isSelfInclude) {
            setError('自己参照は禁止されています')
            return
        }

        const cacheKey = `${wikiSlug}::${page}::${key}`
        const cached = pageCache.get(cacheKey)

        if (cached) {
            setRawContent(cached)
            return
        }

        const controller = new AbortController()

        const fetchPage = async () => {
            try {
                const res = await fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`, {
                signal: controller.signal,
                })

                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

                const { content = '' } = await res.json()
                const lines = content.split('\n')

                if (
                isNaN(start) || isNaN(end) ||
                start < 1 || start > lines.length
                ) {
                    setError('無効な行範囲です')
                    return
                }

                const actualEnd = Math.min(end, lines.length)
                const finalContent = lines.slice(start - 1, actualEnd).join('\n')

                pageCache.set(cacheKey, finalContent)
                setRawContent(finalContent)
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error(err)
                    setError(err.message)
                }
            }
        }

        fetchPage()
        return () => controller.abort()
    }, [wikiSlug, page, key, isSelfInclude, start, end])

    const context = { wikiSlug, pageSlug: page }
    const title = titleOption === 'none' ? null : titleOption || page
    const parsedNodes = parseWikiContent(rawContent, context)

    if (error) return <div className="include-page__error">エラー: {error}</div>
    if (!rawContent.trim()) return null
    if (!parsedNodes.some(node => !!node)) return null

    return (
        <div className="include-page">
        {title && <h2 className="include-page__title">{title}</h2>}
        {parsedNodes.map((node, i) => (
            <React.Fragment key={i}>{node}</React.Fragment>
        ))}
        </div>
    )
}
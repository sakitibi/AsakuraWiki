import React, { useEffect, useState } from 'react'
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

    useEffect(() => {
        if (stylesheetURL && !document.querySelector(`link[href="${stylesheetURL}"]`)) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = stylesheetURL
        document.head.appendChild(link)
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

    // 🔒ページが存在せず、内容が空かエラー → 何も表示しない
    if (error || !rawContent.trim()) return null

    return (
        <div className="include-page">
        {title && <h2 className="include-page__title">{title}</h2>}
        {parseWikiContent(rawContent, context).map((node, i) => (
            <React.Fragment key={i}>{node}</React.Fragment>
        ))}
        </div>
    )
}
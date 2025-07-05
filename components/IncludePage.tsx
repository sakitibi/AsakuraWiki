import React, { useEffect, useState } from 'react'
import { parseWikiContent } from '@/utils/parsePlugins'

interface IncludePageProps {
    wikiSlug: string
    page: string
    showTitle?: boolean
    stylesheetURL?: string
}

export default function IncludePage({
    wikiSlug,
    page,
    showTitle = true,
}: IncludePageProps) {
    const [rawContent, setRawContent] = useState<string>('')

    useEffect(() => {
        fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`)
        .then(res => {
            if (!res.ok) throw new Error(res.statusText)
            return res.json()
        })
        .then(data => setRawContent(data.content || ''))
        .catch(err => {
            console.error(err)
            setRawContent(
            `<p style="color:red;">読み込み失敗: ${err.message}</p>`
            )
        })
    }, [wikiSlug, page])

    const context = { wikiSlug, pageSlug: page }

    return (
        <div className="include-page">
        {showTitle && <h2 className="include-page__title">{page}</h2>}
        <div className="include-page__content">
            {parseWikiContent(rawContent, context).map((node, i) => (
            <React.Fragment key={i}>{node}</React.Fragment>
            ))}
        </div>
        </div>
    )
}
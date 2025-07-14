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
    stylesheetURL,
}: IncludePageProps) {
    const [rawContent, setRawContent] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // 外部 CSS
        if (stylesheetURL) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = stylesheetURL
            document.head.appendChild(link)
        }

        // コンテンツ取得
        fetch(`/api/wiki/${wikiSlug}/${encodeURIComponent(page)}`)
        .then(res => {
            if (!res.ok) {
                // 404,500 などはここでキャッチして state に落とす
                throw new Error(`${res.status} ${res.statusText}`)
            }
            return res.json()
        })
        .then(data => {
            setRawContent(data.content || '')
        })
        .catch(err => {
            console.error(err)
            setError(err.message)   // 生 HTML ではなくエラーメッセージだけ保持
        })
    }, [wikiSlug, page, stylesheetURL])

    const context = { wikiSlug, pageSlug: page }

    return (
        <div className="include-page">
        {showTitle && <h2 className="include-page__title">{page}</h2>}

        {error ? (
            // React の JSX としてエラーを表示
            <p style={{ color: 'red' }}>
            読み込み失敗: {error}
            </p>
        ) : (
            // 正常時はプラグインを再パースして描画
            parseWikiContent(rawContent, context).map((node, i) => (
            <React.Fragment key={i}>{node}</React.Fragment>
            ))
        )}
        </div>
    )
}
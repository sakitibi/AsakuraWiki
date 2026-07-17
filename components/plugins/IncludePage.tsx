import React, { useEffect, useState } from 'react'
import { parseWikiContent } from '@/utils/parsePlugins'
import { designColor } from '@/utils/wiki_settings'
import Pako from 'pako';

interface IncludePageProps {
    wikiSlug: string;
    page: string;
    showTitle?: boolean;
    stylesheetURL?: string;
    lineRange?: string;
    designColor: designColor;
}

export default function IncludePage({
    wikiSlug,
    page,
    showTitle = true,
    stylesheetURL,
    lineRange,
    designColor
}: IncludePageProps) {
    const [error, setError] = useState<string | null>(null)
    const [parsedNodes, setParsedNodes] = useState<React.ReactNode[]>([])

    useEffect(() => {
        if (typeof document === "undefined") return

        if (stylesheetURL) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = stylesheetURL
            document.head.appendChild(link)
        }

        (async function(){
            const res = await fetch(`/api/wiki_v2/${wikiSlug}/${encodeURIComponent(page)}`)
                if (!res.ok) {
                    console.error(`${res.status} ${res.statusText}`);
                    setError(`${res.status} ${res.statusText}`);
                } else {
                    const data = await res.json();
                    try {
                        const content: string = data.content ?? ''
                        const decoded: string = Pako.ungzip(
                            Uint8Array.fromBase64(content),
                            {to: "string"}
                        );
                        let text = decoded;

                        const lines = text.split('\n')

                        if (lineRange) {
                            const [startRaw = '', endRaw = ''] = lineRange.split('-')
                            const start = startRaw ? parseInt(startRaw) : 1
                            const end = endRaw ? parseInt(endRaw) : lines.length

                            if (
                                isNaN(start) ||
                                isNaN(end) ||
                                start < 1 ||
                                end > lines.length ||
                                start > end
                            ) {
                                setError('無効な行範囲です')
                                return
                            }

                            text = lines.slice(start - 1, end).join('\n')
                        }

                        const nodes = await parseWikiContent(
                            text,
                            {
                                wikiSlug,
                                pageSlug: page,
                                variables: {}
                            },
                            designColor
                        )

                        setParsedNodes(nodes)
                        setError(null)
                    } catch (e) {
                        console.error(e)
                        setError('ページ解析に失敗しました')
                    }
                }
        })();
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
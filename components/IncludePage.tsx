import { useEffect, useState } from 'react';

interface IncludePageProps {
    /** ページ名または外部CSSのURL */
    page: string
    /** title|notitle に対応 (true=title 表示, false=notitle 非表示) */
    showTitle?: boolean
}

export default function IncludePage({
    page,
    showTitle = true,
}: IncludePageProps) {
    const [content, setContent] = useState<string>('')

    useEffect(() => {
        // ページコンテンツをフェッチ
        // 実際のエンドポイントやパラメータに合わせて調整してください
        fetch(`/api/wiki/${encodeURIComponent(page)}`)
        .then((res) => {
            if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`)
            return res.text()
        })
        .then((html) => setContent(html))
        .catch((err) => {
            console.error(err)
            setContent(`<p style="color:red;">ページの読み込みに失敗しました: ${err.message}</p>`)
        })
    }, [page])

    return (
        <div className="include-page">
        {showTitle && <h2 className="include-page__title">{page}</h2>}
        <div
            className="include-page__content"
            dangerouslySetInnerHTML={{ __html: content }}
        />
        </div>
    )
}
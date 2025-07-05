import { useEffect, useState } from 'react'

interface IncludePageProps {
    /** ページ名または「ページ名|外部CSS URL[,title|,notitle]」 */
    page: string
    /** title 表示(true)／非表示(false)（parse で上書き可） */
    showTitle?: boolean
}

export default function IncludePage({
    page,
    showTitle = true,
}: IncludePageProps) {
    const [content, setContent] = useState<string>('')

    // page prop から「ページ名」「外部CSS」「title/notitle」を分解
    let pageName = page
    let stylesheetURL: string | undefined
    let flag: 'title' | 'notitle' | undefined

    // 1) カンマで分割してフラグを取得
    const parts = page.split(',').map((s) => s.trim())
    if (parts.length >= 2) {
        pageName = parts[0]
        flag = parts[1] === 'notitle' ? 'notitle' : parts[1] === 'title' ? 'title' : undefined
    }

    // 2) 「ページ名|stylesheetURL」の形式をさらに分解
    if (pageName.includes('|')) {
        const [name, css] = pageName.split('|').map((s) => s.trim())
        pageName = name
        stylesheetURL = css
    }

    // flag があれば showTitle を上書き
    if (flag === 'notitle') showTitle = false
    if (flag === 'title') showTitle = true

    useEffect(() => {
        // 外部 CSS の読み込み
        if (stylesheetURL) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = stylesheetURL
            document.head.appendChild(link)
        }

        // ページコンテンツをフェッチ
        fetch(`/api/wiki/${encodeURIComponent(pageName)}`)
        .then((res) => {
            if (!res.ok) throw new Error(res.statusText)
            return res.text()
        })
        .then((html) => setContent(html))
        .catch((err) => {
            console.error(err)
            setContent(
            `<p style="color:red;">ページの読み込みに失敗しました: ${err.message}</p>`
            )
        })
    }, [pageName, stylesheetURL])

    return (
        <div className="include-page">
        {showTitle && <h2 className="include-page__title">{pageName}</h2>}
        <div
            className="include-page__content"
            dangerouslySetInnerHTML={{ __html: content }}
        />
        </div>
    )
}
import { useEffect, useState } from 'react'

interface TocItem {
    id: string
    text: string
    level: number
}

export default function TableOfContents() {
    const [items, setItems] = useState<TocItem[]>([])

    useEffect(() => {
        // ページ内の h2, h3, h4 をすべて取得
        const headings:HTMLHeadingElement[] = Array.from(
            document.querySelectorAll<HTMLHeadingElement>('h2, h3, h4')
        )

        const toc:TocItem[] = headings.map< TocItem >(heading => {
            // 見出しレベル（h2→2, h3→3, h4→4）
            const level:number = parseInt(heading.tagName.substring(1), 10)

            // id がなければ slug を自動生成してセット
            let id:string = heading.id
            if (!id) {
                id = heading.textContent
                ?.trim()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[!\"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '') || ''
                heading.id = id
            }

            return {
                id,
                text: heading.textContent || '',
                level,
            }
        })
        setItems(toc)
    }, [])

    return (
        <nav className="table-of-contents">
            <ul>
                {items.map(item => (
                <li
                    key={item.id}
                    style={{ marginLeft: (item.level - 2) * 16 }}
                >
                    <a href={`#${item.id}`}>{item.text}</a>
                </li>
                ))}
            </ul>
        </nav>
    )
}
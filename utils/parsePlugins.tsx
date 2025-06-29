import React from 'react'
import Calendar2 from '@/components/Calendar2'

export function parseWikiContent(content: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    // カレンダーとアコーディオンを両方拾えるように両方の正規表現を OR でまとめる
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/g
    let m: RegExpExecArray | null

    while ((m = re.exec(content))) {
        // 1) マッチ前のテキストを push
        if (m.index > lastIndex) {
        nodes.push(content.slice(lastIndex, m.index))
        }

        // 2) #calendar2(...) にマッチした場合
        if (m[1] && m[2]) {
        const year = parseInt(m[1], 10)
        const month = parseInt(m[2], 10)
        const hideHolidays = m[3] === 'off'
        nodes.push(
            <Calendar2
            key={`cal-${year}-${month}-${m.index}`}
            year={year}
            month={month}
            hideHolidays={hideHolidays}
            />
        )
        }
        // 3) #accordion(...) にマッチした場合
        else if (m[4]) {
        const title = m[4]
        const level = m[5]!   // "*", "**", "***"
        const isOpen = m[6] === 'open'
        const body = m[7]!
        const Heading = level === '*' ? 'h3' : level === '**' ? 'h4' : 'h5'
        nodes.push(
            <details key={`acc-${m.index}`} open={isOpen}>
            <summary>{React.createElement(Heading, {}, title)}</summary>
            <div>
                {body.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    <br />
                </React.Fragment>
                ))}
            </div>
            </details>
        )
        }

        lastIndex = re.lastIndex
    }

    // 4) 残りのテキスト
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }

    return nodes
}
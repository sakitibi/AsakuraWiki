import React from 'react'
import Calendar2 from '@/components/Calendar2'

export function parseWikiContent(
    content: string
    ): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let cursor = 0

    // プラグイン or アコーディオンの正規表現をまとめて
    const re = /#calendar2\((\d{6})(?:,(off))?\)|#accordion\(([^,]+),(\*{1,3}),(open|close)\)\{\{([\s\S]*?)\}\}/g
    let m: RegExpExecArray | null

    while ((m = re.exec(content))) {
        // 置き換え前のプレーン文字テキストを追加
        if (m.index > cursor) {
        nodes.push(content.slice(cursor, m.index))
        }

        // calendar2 マッチ
        if (m[0].startsWith('#calendar2')) {
        const yyyymm = m[1]!
        const off = m[2] === 'off'
        const year = Number(yyyymm.slice(0, 4))
        const month = Number(yyyymm.slice(4))
        nodes.push(
            <Calendar2
            key={`cal-${year}-${month}-${m.index}`}
            year={year}
            month={month}
            hideHolidays={off}
            />
        )
        }
        // accordion マッチ
        else if (m[0].startsWith('#accordion')) {
        const title = m[3]!
        const level = m[4]!  // "*", "**", "***"
        const state = m[5]!  // "open"|"close"
        const body = m[6]!
        const Heading = level === '*' ? 'h3' : level === '**' ? 'h4' : 'h5'
        nodes.push(
            <details
            key={`acc-${title}-${m.index}`}
            open={state === 'open'}
            >
            <summary>
                {React.createElement(Heading, null, title)}
            </summary>
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

        cursor = m.index + m[0].length
    }

    // 残りテキスト
    if (cursor < content.length) {
        nodes.push(content.slice(cursor))
    }
    return nodes
}
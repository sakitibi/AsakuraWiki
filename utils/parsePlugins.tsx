// utils/parsePlugins.tsx
import React from 'react'
import Calendar2 from '@/components/Calendar2'
import { DATEDIF, DATEVALUE } from './dateFunctions'

const CAL_RE       = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/   // m[1]=年, m[2]=月, m[3]=off?
const DATEDIF_RE  = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/
const DATEVALUE_RE= /#DATEVALUE\(\s*([^)]+)\s*\)/
const ACC_RE       = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/

export function parseWikiContent(content: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    // 全プラグインまとめてOR、最後に g をつける
    const re = new RegExp([
        CAL_RE.source,
        DATEDIF_RE.source,
        DATEVALUE_RE.source,
        ACC_RE.source
    ].join('|'), 'g')

    let m: RegExpExecArray | null
    while ((m = re.exec(content))) {
        // 1) マッチ前のテキスト
        if (m.index > lastIndex) {
            nodes.push(content.slice(lastIndex, m.index))
        }

        // 2) #calendar2
        if (m[1] && m[2]) {
            const year  = +m[1]
            const month = +m[2]
            const off   = m[3] === 'off'
            nodes.push(
                <Calendar2
                key={`cal-${year}-${month}-${m.index}`}
                year={year}
                month={month}
                hideHolidays={off}
                />
            )
        }
        // 3) #DATEDIF
        else if (m[4] && m[5] && m[6]) {
            const val = DATEDIF(m[4], m[5], m[6] as 'Y'|'M'|'D')
            nodes.push(
                <span key={`dif-${m.index}`} className="datedif-result">
                {isNaN(val) ? 'ERR' : val}
                </span>
            )
        }
        // 4) #DATEVALUE
        else if (m[7]) {
            const val = DATEVALUE(m[7])
            nodes.push(
                <span key={`dv-${m.index}`} className="datevalue-result">
                {isNaN(val) ? 'ERR' : val}
                </span>
            )
        }
        // 5) #accordion …{{body}}
        else if (m[8] && m[9] && m[10] && m[11] !== undefined) {
            const title  = m[8]
            const level  = m[9]             // "*","**","***"
            const isOpen = m[10] === 'open'
            const body   = m[11]            // ここにネストの可能性あり

            // 再帰的にパースしてネストを解決
            const childNodes = parseWikiContent(body)

            // 見出しタグを決定
            const HeadingTag = level === '*'  ? 'h3'
                                : level === '**' ? 'h4'
                                : 'h5'

            nodes.push(
                <details key={`acc-${m.index}`} open={isOpen}>
                <summary>
                    {React.createElement(HeadingTag, {}, title)}
                </summary>
                <div>
                    {childNodes.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                    ))}
                </div>
                </details>
            )
        }

        lastIndex = re.lastIndex
    }

    // 6) 残りテキスト
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }

    return nodes
}
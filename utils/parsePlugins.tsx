import React from 'react';
import Calendar2 from '@/components/Calendar2';
import { DATEDIF, DATEVALUE } from './dateFunctions';

const CAL_RE = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/g
const DATEDIF_RE = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/g
const DATEVALUE_RE = /#DATEVALUE\(\s*([^)]+)\s*\)/g

export function parseWikiContent(content: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let last = 0

    // 日付系を含むすべてのプラグインをまとめて一発でマッチ
    const re = new RegExp(
        [CAL_RE.source, DATEDIF_RE.source, DATEVALUE_RE.source].join('|'),
        'g'
    )
    let m: RegExpExecArray | null

    while ((m = re.exec(content))) {
        // 1) マッチ前のテキスト
        if (m.index > last) {
        nodes.push(content.slice(last, m.index))
        }

        // 2) #calendar2
        if (m[1] && m[2]) {
        const year = Number(m[1])
        const month = Number(m[2])
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
        // 3) #DATEDIF
        else if (m[4] && m[5] && m[6]) {
        const start = m[4]
        const end = m[5]
        const unit = m[6] as 'Y' | 'M' | 'D'
        const val = DATEDIF(start, end, unit)
        nodes.push(
            <span key={`dif-${m.index}`} className="datedif-result">
            {isNaN(val) ? 'ERR' : val}
            </span>
        )
        }
        // 4) #DATEVALUE
        else if (m[7]) {
        const txt = m[7]
        const val = DATEVALUE(txt)
        nodes.push(
            <span key={`dv-${m.index}`} className="datevalue-result">
            {isNaN(val) ? 'ERR' : val}
            </span>
        )
        }

        last = re.lastIndex
    }

    // 5) 残りテキスト
    if (last < content.length) {
        nodes.push(content.slice(last))
    }

    return nodes
}
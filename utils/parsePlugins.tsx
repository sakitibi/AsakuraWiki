import React from 'react'
import Calendar2 from '@/components/Calendar2'
import CommentForm from '@/components/CommentForm'
import RealTimeComments from '@/components/RealTimeComments'
// import PagedComments from '@/components/PagedComments'  // #pcomment を使う場合はコメント解除
import { DATEDIF, DATEVALUE } from './dateFunctions'

export type Context = {
    wikiSlug: string
    pageSlug: string
}

/**
 * Wiki 本文中のプラグイン構文を ReactNode 配列に変換
 */
export function parseWikiContent(
    content: string,
    context: Context
): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context
    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    // 各プラグインの正規表現（キャプチャ順に注意）
    const CAL_RE       = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/      // m[1]=YYYY, m[2]=MM, m[3]=off?
    const DATEDIF_RE  = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/  // m[4-6]
    const DATEVALUE_RE= /#DATEVALUE\(\s*([^)]+)\s*\)/                // m[7]
    const ACC_RE       = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/  // m[8-11]

    // comment 系は丸ごとキャプチャして m[12], m[13] に入るようにする
    const COMMENT_RE  = /(#comment)\b/      // m[12]
    const RTCM_RE     = /(#rtcomment)\b/    // m[13]
    // const PCOMM_RE  = /(#pcomment)\b/     // m[14] を使う場合アンコメント

    // 全プラグインを OR でまとめ、g フラグを付与
    const re = new RegExp(
        [
        CAL_RE.source,
        DATEDIF_RE.source,
        DATEVALUE_RE.source,
        ACC_RE.source,
        COMMENT_RE.source,
        RTCM_RE.source,
        // PCOMM_RE.source,
        ].join('|'),
        'g'
    )

    let m: RegExpExecArray | null
    while ((m = re.exec(content))) {
        // マッチ前のテキストを追加
        if (m.index > lastIndex) {
        nodes.push(content.slice(lastIndex, m.index))
        }

        // 1) #calendar2(YYYYMM[,off])
        if (m[1] && m[2]) {
        const year       = Number(m[1])
        const month      = Number(m[2])
        const hideHolidays = m[3] === 'off'
        nodes.push(
            <Calendar2
            key={`cal-${lastIndex}`}
            year={year}
            month={month}
            hideHolidays={hideHolidays}
            />
        )
        }
        // 2) #DATEDIF(start,end,unit)
        else if (m[4] && m[5] && m[6]) {
        const val = DATEDIF(m[4], m[5], m[6] as 'Y' | 'M' | 'D')
        nodes.push(
            <span key={`dif-${lastIndex}`} className="datedif-result">
            {isNaN(val) ? 'ERR' : val}
            </span>
        )
        }
        // 3) #DATEVALUE(text)
        else if (m[7]) {
        const val = DATEVALUE(m[7])
        nodes.push(
            <span key={`dv-${lastIndex}`} className="datevalue-result">
            {isNaN(val) ? 'ERR' : val}
            </span>
        )
        }
        // 4) #accordion(title,level,state){{body}}
        else if (m[8] && m[9] && m[10] && m[11] !== undefined) {
        const title   = m[8]
        const level   = m[9]
        const isOpen  = m[10] === 'open'
        const body    = m[11]
        const Heading = level === '*' ? 'h3' : level === '**' ? 'h4' : 'h5'
        // 再帰呼び出しでネストをパース
        const children = parseWikiContent(body, context)
        nodes.push(
            <details key={`acc-${lastIndex}`} open={isOpen}>
            <summary>{React.createElement(Heading, {}, title)}</summary>
            <div>
                {children.map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </div>
            </details>
        )
        }
        // 5) #comment
        else if (m[12] === '#comment') {
        nodes.push(<CommentForm key={`cf-${lastIndex}`} />)
        }
        // 6) #rtcomment
        else if (m[13] === '#rtcomment') {
        nodes.push(
            <RealTimeComments
            key={`rtc-${lastIndex}`}
            wikiSlug={wikiSlug}
            pageSlug={pageSlug}
            />
        )
        }
        // 7) #pcomment を使う場合
        /* else if (m[14] === '#pcomment') {
        nodes.push(
            <PagedComments
            key={`pc-${lastIndex}`}
            wikiSlug={wikiSlug}
            pageSlug={pageSlug}
            />
        )
        } */

        lastIndex = re.lastIndex
    }

    // 残りのテキストを push
    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }

    return nodes
}
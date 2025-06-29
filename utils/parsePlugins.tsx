import React from 'react'
import Calendar2 from '@/components/Calendar2'
import CommentForm from '@/components/CommentForm'
import RealTimeComments from '@/components/RealTimeComments'
import { DATEDIF, DATEVALUE } from './dateFunctions'

export type Context = { wikiSlug: string; pageSlug: string }

/** Wiki 本文中のプラグイン構文を ReactNode 配列に変換 */
export function parseWikiContent(
    content: string,
    context: Context
): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context
    const nodes: React.ReactNode[] = []
    let lastIndex = 0

    const CAL_RE        = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)/
    const DATEDIF_RE   = /#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)/
    const DATEVALUE_RE = /#DATEVALUE\(\s*([^)]+)\s*\)/
    const ACC_RE        = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/
    const COMMENT_RE    = /(#comment)\b/             // m[12]
    const RTCM_RE       = /(#rtcomment)(?:\(\))?\b/  // m[13]

    const re = new RegExp(
        [
        CAL_RE.source,
        DATEDIF_RE.source,
        DATEVALUE_RE.source,
        ACC_RE.source,
        COMMENT_RE.source,
        RTCM_RE.source,
        ].join('|'),
        'g'
    )

    let m: RegExpExecArray | null
    while ((m = re.exec(content))) {
        // ← 何がマッチしているかデバッグしたいときはここに console.log(m)
        if (m.index > lastIndex) {
        nodes.push(content.slice(lastIndex, m.index))
        }

        if (m[1] && m[2]) {
        // #calendar2
        const year = +m[1], month = +m[2], off = m[3] === 'off'
        nodes.push(<Calendar2 key={m.index} year={year} month={month} hideHolidays={off} />)
        }
        else if (m[4] && m[5] && m[6]) {
        // #DATEDIF
        const val = DATEDIF(m[4], m[5], m[6] as any)
        nodes.push(<span key={m.index}>{isNaN(val)? 'ERR': val}</span>)
        }
        else if (m[7]) {
        // #DATEVALUE
        const val = DATEVALUE(m[7])
        nodes.push(<span key={m.index}>{isNaN(val)? 'ERR': val}</span>)
        }
        else if (m[8] && m[9] && m[10] && m[11] !== undefined) {
        // #accordion
        const title = m[8], lvl = m[9], open = m[10]==='open', body = m[11]
        const Tag = lvl==='*'? 'h3': lvl==='**'? 'h4': 'h5'
        const children = parseWikiContent(body, context)
        nodes.push(
            <details key={m.index} open={open}>
            <summary>{React.createElement(Tag, {}, title)}</summary>
            <div>{children}</div>
            </details>
        )
        }
        else if (m[12] === '#comment') {
        nodes.push(<CommentForm key={m.index} />)
        }
        else if (m[13] === '#rtcomment') {
        nodes.push(<RealTimeComments key={m.index} wikiSlug={wikiSlug} pageSlug={pageSlug} />)
        }

        lastIndex = re.lastIndex
    }

    if (lastIndex < content.length) {
        nodes.push(content.slice(lastIndex))
    }
    return nodes
}
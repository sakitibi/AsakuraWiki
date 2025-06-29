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
            const title = m[8], lvl = m[9], open = m[10] === 'open', body = m[11]
            const Tag = lvl === '*' ? 'h2' : lvl === '**' ? 'h3' : 'h4'
            const children = parseWikiContent(body, context)

            const iconPath = open
                ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z' // minus
                : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z' // plus

            const headingStyle =
            Tag === 'h2'
                ? {
                    borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
                    borderRight: '1px solid #ea94bc',
                    borderTop: '1px solid #ea94bc',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: '0.25em',
                }
                : Tag === 'h3'
                ? {
                    borderColor: '#ea94bc',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: '0.25em',
                }
                : Tag === 'h4'
                ? {
                    borderLeft: '15px solid #ea94bc',
                    paddingLeft: '0.5em',
                }
                : {}

            nodes.push(
            <div
                key={m.index}
                className={open ? 'open' : 'closed'}
                style={{ display: 'block', unicodeBidi: 'isolate' }}
            >
                {React.createElement(
                Tag,
                { style: headingStyle },
                [
                    title,
                    <svg
                    key="icon"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon={open ? 'square-minus' : 'square-plus'}
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    style={{ marginLeft: '0.5em', width: '1em', height: '1em' }}
                    >
                    <path fill="currentColor" d={iconPath} />
                    </svg>,
                ]
                )}
                <div>{children}</div>
            </div>
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
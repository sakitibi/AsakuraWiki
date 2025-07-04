import React, { useState } from 'react'
import Calendar2 from '@/components/Calendar2'
import CommentForm from '@/components/CommentForm'
import RealTimeComments from '@/components/RealTimeComments'
import { DATEDIF, DATEVALUE } from './dateFunctions'

export type Context = { wikiSlug: string; pageSlug: string }

/**
 * ネスト可能なアコーディオンブロックを文字列から抽出します
 */
function extractAccordions(content: string) {
    type Block = {
        prefix?: string
        title?: string
        level?: '*' | '**' | '***'
        isOpen?: boolean
        body?: string
    }

    const blocks: Block[] = []
    let cursor = 0
    const startRe = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{/g

    while (true) {
        startRe.lastIndex = cursor
        const m = startRe.exec(content)
        if (!m) break
        const [whole, title, lvl, state] = m
        const bodyStart = m.index + whole.length
        let depth = 1
        let i = bodyStart
        while (i < content.length && depth > 0) {
            if (content.slice(i, i + 2) === '{{') {
                depth++
                i += 2
            } else if (content.slice(i, i + 2) === '}}') {
                depth--
                i += 2
            } else {
                i++
            }
        }
        const body = content.slice(bodyStart, i - 2)
        blocks.push({ prefix: content.slice(cursor, m.index) })
        blocks.push({ title: title.trim(), level: lvl as any, isOpen: state === 'open', body })
        cursor = i
    }

    blocks.push({ prefix: content.slice(cursor) })
    return blocks
}

/** インラインプラグインを処理します */
function parseInline(text: string, context: Context): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context
    const nodes: React.ReactNode[] = []
    let last = 0
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment/g
    let m: RegExpExecArray | null

    while ((m = re.exec(text))) {
        if (m.index > last) {
            nodes.push(text.slice(last, m.index))
        }
        const token = m[0]
        if (token.startsWith('#calendar2')) {
            const [, y, mo, off] = m
            nodes.push(<Calendar2 key={m.index} year={+y} month={+mo} hideHolidays={off === 'off'} />)
        } else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={m.index}>{isNaN(val) ? 'ERR' : val}</span>)
        } else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={m.index}>{isNaN(val) ? 'ERR' : val}</span>)
        } else if (token === '#comment') {
            nodes.push(<CommentForm key={m.index} />)
        } else if (token.startsWith('#rtcomment')) {
            console.log('⚡️ RTCOMMENT FOUND in text:', text);
            nodes.push(
                <RealTimeComments
                key={m.index}
                wikiSlug={wikiSlug}
                pageSlug={pageSlug}
                />
            );
        }
        last = re.lastIndex
    }
    if (last < text.length) nodes.push(text.slice(last))
    return nodes
}

    /**
     * アコーディオンとインラインプラグインを再帰的にパースするメイン関数
     */
    export function parseWikiContent(content: string, context: Context): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    const blocks = extractAccordions(content)

    blocks.forEach((blk, idx) => {
        // prefix 部分をインライン処理
        if (blk.prefix) {
            nodes.push(...parseInline(blk.prefix, context))
        }
        // アコーディオンブロック
        if (blk.title) {
            const children = parseWikiContent(blk.body!, context)
            nodes.push(
                <Accordion key={`acc-${idx}`} title={blk.title!} level={blk.level!} initiallyOpen={blk.isOpen!}>
                {children}
                </Accordion>
            )
        }
    })

    return nodes
}

/** Accordion コンポーネント */
function Accordion({ title, level, initiallyOpen, children, }: { title: string; level: '*' | '**' | '***'; initiallyOpen: boolean; children: React.ReactNode; }) {
    const [open, setOpen] = useState(initiallyOpen)
    const Tag = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const iconPath = open
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7c24-24 c24s-24-10.7-24-24z'
    const headingStyle: React.CSSProperties = level === '*'
    ? {}
    : level === '**'
        ? {
            display: 'block',
            fontSize: '1.17em',
            marginBlockStart: '1em',
            marginBlockEnd: '1em',
            marginInlineStart: '0px',
            marginInlineEnd: '0px',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            border: '1px solid',
            borderLeft: '15px solid',
            backgroundColor: 'transparent',
            borderColor: '#ea94bc',
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em'
        }
    : {};

    return (
        <div style={{ margin: '1em 0' }}>
        <Tag onClick={() => setOpen(!open)} style={headingStyle}>
            {title}
            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '1em', height: '1em' }}>
            <path fill="currentColor" d={iconPath} />
            </svg>
        </Tag>
        {open && <div style={{ paddingLeft: '1em', }}>{children}</div>}
        </div>
    )
}
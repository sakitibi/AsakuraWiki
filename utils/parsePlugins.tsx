import React, { useState } from 'react'
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
    const nodes: React.ReactNode[] = []
    let lastEnd = 0

    // 正規表現定義
    const ACC_RE = /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/g
    const INLINE_RE = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment\b|#comment\b/g

    // 1. アコーディオンブロックを先に抽出
    let m: RegExpExecArray | null
    while ((m = ACC_RE.exec(content))) {
        // アコーディオン前のプレーンテキストを再帰解析
        if (m.index > lastEnd) {
            nodes.push(...parseWikiContent(content.slice(lastEnd, m.index), context))
        }
        // アコーディオンの引数とボディ
        const [, title, level, state, body] = m
        const initiallyOpen = state === 'open'
        const children = parseWikiContent(body, context)

        // アコーディオンコンポーネント
        nodes.push(
        <Accordion
            key={m.index}
            title={title}
            level={level as '*' | '**' | '***'}
            initiallyOpen={initiallyOpen}
        >
            {children}
        </Accordion>
        )

        lastEnd = ACC_RE.lastIndex
    }

    // アコーディオン後の残りテキスト
    const tail = content.slice(lastEnd)
    if (!tail) return nodes

    // 2. プレーンテキスト部をインラインプラグインで置換
    let plainLast = 0
    while ((m = INLINE_RE.exec(tail))) {
        if (m.index > plainLast) {
        nodes.push(tail.slice(plainLast, m.index))
        }
        const token = m[0]
        if (token.startsWith('#calendar2')) {
            const [, y, mo, off] = m
            nodes.push(
                <Calendar2
                key={m.index}
                year={+y}
                month={+mo}
                hideHolidays={off === 'off'}
                />
            )
        } else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={m.index}>{isNaN(val) ? 'ERR' : val}</span>)
        } else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={m.index}>{isNaN(val) ? 'ERR' : val}</span>)
        } else if (token === '#comment') {
            nodes.push(<CommentForm key={m.index} />)
        } else if (token === '#rtcomment') {
            nodes.push(
                <RealTimeComments
                key={m.index}
                wikiSlug={context.wikiSlug}
                pageSlug={context.pageSlug}
                />
            )
        }
        plainLast = INLINE_RE.lastIndex
    }

    // 残りテキスト
    if (plainLast < tail.length) {
        nodes.push(tail.slice(plainLast))
    }

    return nodes
}

    /** Accordion コンポーネント */
function Accordion({
    title,
    level,
    initiallyOpen,
    children,
    }: {
    title: string
    level: '*' | '**' | '***'
    initiallyOpen: boolean
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(initiallyOpen)
    const Tag = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const iconPath = isOpen
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z'
    const headingStyle =
        level === '*'
        ? {
            borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
            borderStyle: 'solid',
            borderWidth: '1px',
            padding: '0.25em',
            backgroundColor: '#fad6e7',
            cursor: 'pointer',
            }
        : level === '**'
        ? { borderColor: '#ea94bc', borderStyle: 'solid', borderWidth: '1px', padding: '0.25em', cursor: 'pointer' }
        : { borderLeft: '15px solid #ea94bc', paddingLeft: '0.5em', cursor: 'pointer' }
    return (
        <div className={isOpen ? 'open' : 'closed'} style={{ marginBottom: '1rem' }}>
        {React.createElement(
            Tag,
            { style: headingStyle, onClick: () => setIsOpen(!isOpen) },
            [
            title,
            <svg
                key="icon"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon={isOpen ? 'square-minus' : 'square-plus'}
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                style={{ marginLeft: '0.5em', width: '1em', height: '1em' }}
            >
                <path fill="currentColor" d={iconPath} />
            </svg>,
            ]
        )}
        {isOpen && <div style={{ padding: '0.5em 0' }}>{children}</div>}
        </div>
    )
}
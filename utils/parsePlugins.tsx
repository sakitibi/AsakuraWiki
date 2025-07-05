import React, { useState } from 'react'
import Calendar2 from '@/components/Calendar2'
import CommentForm from '@/components/CommentForm'
import RealTimeComments from '@/components/RealTimeComments'
import PageList from '@/components/PageList'
import PageList2 from '@/components/PageList2'
import IncludePage from '@/components/IncludePage'
import TableOfContents from '@/components/TableOfContents'
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
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let nodeKey = 0;

    text.split("\n").forEach((line) => {
        // 1) 行頭が "*","**","***" 見出しか?
        const headingMatch = line.match(/^(\*{1,3})\s*(.+)/);
        if (headingMatch) {
            const [ , stars, title ] = headingMatch;
            nodes.push(
                <Header
                key={`hdr-${nodeKey++}`}
                level={stars as "*" | "**" | "***"}
                title={title}
                />
            );
            return;
        }

        // 2) 見出し以外のインラインプラグインを処理する
        //    ここでは既存の re を使って text ノードを分解するヘルパーを想定
        nodes.push(...parseOtherInline(line, wikiSlug, pageSlug, nodeKey));
        nodeKey += 10; // 適当にキーを進める
    });

    return nodes;
}

/** 既存の #calendar2 や #comment 系を処理するヘルパー */
export function parseOtherInline(
    line: string,
    wikiSlug: string,
    pageSlug: string,
    baseKey: number
): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    let last = 0
    let m: RegExpExecArray | null

    // 各プラグインを順次キャプチャする正規表現
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9-]+)\s*,\s*([0-9-]+)\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment|#hr|#ls(?:\(([^)]+)\))?|#ls2\(\s*([^[\],]+)(?:\[\s*([^\]]+)\s*\])?(?:,\s*\{\s*([^}]+)\s*\})?(?:,\s*([^)]+))?\)|#include\(([^)]+)\)|#contents/giu

    while ((m = re.exec(line))) {
        // トークンの手前テキストをそのまま文字ノードに
        if (m.index > last) {
            nodes.push(line.slice(last, m.index))
        }
        const token = m[0]
        const key = `inl-${baseKey}-${m.index}`

        // --- plugin branches ---
        // #calendar2(Y,M,off?)
        if (token.startsWith('#calendar2')) {
            const [, y, mo, off] = m
            nodes.push(
                <Calendar2
                    key={key}
                    year={+y}
                    month={+mo}
                    hideHolidays={off === 'off'}
                />
            )
        }
        // #DATEDIF(d1,d2,unit)
        else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
        }
        // #DATEVALUE(str)
        else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
        }
        // #comment
        else if (token === '#comment') {
            nodes.push(<CommentForm key={key} />)
        }
        // #rtcomment
        else if (token.startsWith('#rtcomment')) {
            nodes.push(
                <RealTimeComments
                    key={key}
                    wikiSlug={wikiSlug}
                    pageSlug={pageSlug}
                />
            )
        }
        // #hr
        else if (token === '#hr') {
            nodes.push(<hr key={key} />)
        }
        // #ls([title])
        else if (token.startsWith('#ls')) {
            const prefix = m[8]?.trim() || undefined
            nodes.push(<PageList key={key} prefix={prefix} />)
        }
        // #ls2(pattern[,…][,…][,…])
        else if (token.startsWith('#ls2')) {
            // m[9] = パターン (例: 'Foo/')
            // m[10] = [オプションリスト]
            // m[11] = {include,...} ブロック型オプション
            // m[12] = 表示用ラベル
            const pattern = m[9].trim()
            const opts = m[10]?.split(',').map(s => s.trim()) ?? []
            const blockOpts = m[11]?.split(',').map(s => s.trim()) ?? []
            const label = m[12]?.trim()

            nodes.push(
                <PageList2
                    key={key}
                    wikiSlug={wikiSlug}
                    pattern={pattern}
                    options={[...opts, ...blockOpts]}
                    label={label}
                />
            )
        }
        // #include(pageName|css,flag)
        else if (token.startsWith('#include')) {
            const arg = m[13]!.trim()
            const [first, flag] = arg.split(',').map(s => s.trim())
            let showTitle: boolean | undefined
            if (flag === 'notitle') showTitle = false
            else if (flag === 'title') showTitle = true

            let pageName = first
            let stylesheetURL: string | undefined
            if (first.includes('|')) {
                const [name, css] = first.split('|', 2).map(s => s.trim())
                pageName = name
                stylesheetURL = css
            }

            nodes.push(
                <IncludePage
                    key={key}
                    wikiSlug={wikiSlug}
                    page={pageName}
                    showTitle={showTitle}
                    stylesheetURL={stylesheetURL}
                />
            )
        }
        // #contents
        else if (token === '#contents') {
            nodes.push(<TableOfContents key={key} />)
        }

        // 次マッチ開始位置を更新
        last = re.lastIndex
    }

    // 最後に残ったテキスト
    if (last < line.length) {
        nodes.push(line.slice(last))
    }
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
    ? {
        color: '#000',
        margin: '.2em 0 .5em',
        padding: '.3em .3em .15em .5em',
        backgroundColor: '#fad6e7',
        border: '0',
        borderBottom: '1px solid',
        borderLeft: '15px solid',
        display: 'block',
        fontSize: '1.5em',
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        fontWeight: 'bold',
        unicodeBidi: 'isolate',
        borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
        borderRight: '1px solid #ea94bc',
        borderTop: '1px solid #ea94bc',
        cursor: 'pointer'
    }
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
            padding: '.3em .3em .15em .5em',
            cursor: 'pointer'
        }
    : {
        borderLeft: '15px solid #ea94bc',
        cursor: 'pointer',
        display: 'block',
        marginBlockStart: '1.33em',
        marginBlockEnd: '1.33em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        fontWeight: 'bold',
        unicodeBidi: 'isolate',
        backgroundColor: 'transparent',
        color: '#000',
        margin: '.2em 0 .5em',
        padding: '.3em .3em .15em .5em'
    };

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

/** Header コンポーネント */
function Header({ title, level, }: { title: string; level: '*' | '**' | '***'; }) {
    const Tag = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const headingStyle: React.CSSProperties = level === '*'
    ? {
        color: '#000',
        margin: '.2em 0 .5em',
        padding: '.3em .3em .15em .5em',
        backgroundColor: '#fad6e7',
        border: '0',
        borderBottom: '1px solid',
        borderLeft: '15px solid',
        display: 'block',
        fontSize: '1.5em',
        marginBlockStart: '0.83em',
        marginBlockEnd: '0.83em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        fontWeight: 'bold',
        unicodeBidi: 'isolate',
        borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
        borderRight: '1px solid #ea94bc',
        borderTop: '1px solid #ea94bc',
    }
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
            padding: '.3em .3em .15em .5em',
        }
    : {
        borderLeft: '15px solid #ea94bc',
        display: 'block',
        marginBlockStart: '1.33em',
        marginBlockEnd: '1.33em',
        marginInlineStart: '0px',
        marginInlineEnd: '0px',
        fontWeight: 'bold',
        unicodeBidi: 'isolate',
        backgroundColor: 'transparent',
        color: '#000',
        margin: '.2em 0 .5em',
        padding: '.3em .3em .15em .5em'
    };

    return (
        <div style={{ margin: '1em 0' }}>
            <Tag style={headingStyle}>
                {title}
            </Tag>
        </div>
    )
}
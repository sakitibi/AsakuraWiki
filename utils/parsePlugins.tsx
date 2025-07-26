import React, { useState, useEffect } from 'react'
import Calendar2 from '@/components/Calendar2'
import CommentForm from '@/components/CommentForm'
import RealTimeComments from '@/components/RealTimeComments'
import PageList from '@/components/PageList'
import PageList2 from '@/components/PageList2'
import IncludePage from '@/components/IncludePage'
import TableOfContents from '@/components/TableOfContents'
import SelContainer from '@/components/SelContainer';
import SelRow from '@/components/SelRow';
import SelContent from '@/components/SelContent';
import { DATEDIF, DATEVALUE } from './dateFunctions';
import { supabase } from 'lib/supabaseClient';
import { useRouter } from 'next/router'

export type Context = { wikiSlug: string; pageSlug: string }

export function useDesignColor(slug: string) {
    const router = useRouter()
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const [color, setColor] = useState<'pink' | 'blue' | 'yellow' | 'default' | null>(null);

    useEffect(() => {
        async function fetchColor() {
            const { data, error } = await supabase
                .from('wikis')
                .select('design_color')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                setColor('default');
                return;
            }

            setColor(data.design_color);
        }

        fetchColor();
    }, [slug]);

    return color;
}
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

function isValidLineRange(range: string): boolean {
    const trimmed = range.trim()
    // 対応: "1", "1-", "-5", "3-8"
    return /^(\d+)?-(\d+)?$/.test(trimmed) || /^\d+$/.test(trimmed)
}

function extractBracedBlock(source: string, startIdx: number): { body: string, end: number } {
    let depth = 0
    let i = startIdx
    while (i < source.length) {
        if (source[i] === '{') depth++
        else if (source[i] === '}') {
            depth--
            if (depth === 0) break
        }
        i++
    }
    return {
        body: source.slice(startIdx + 1, i),
        end: i + 1,
    }
}

/** 既存の #calendar2 や #comment 系を処理するヘルパー */
export function parseOtherInline(
    line: string,
    wikiSlug: string,
    pageSlug: string,
    baseKey: number,
): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    const safeTrim = (v: unknown) => typeof v === 'string' ? v.trim() : ''
    let last = 0
    let m: RegExpExecArray | null

    // 各プラグインを順次キャプチャする正規表現
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9-]+)\s*,\s*([0-9-]+)\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment|#hr|#br|&br;|#ls(?:\(([^)]+)\))?|#ls2\(\s*([^[\],]+)(?:\[\s*([^\]]+)\s*\])?(?:,\s*\{\s*([^}]+)\s*\})?(?:,\s*([^)]+))?\)|#include\(([^)]+)\)|#contents|^CENTER:\s*(.+)|^LEFT:\s*(.+)|^RIGHT:\s*(.+)|&size\((\d+)\)\{([^}]+)\};|\[\[([^\]>]+)>([^\]]+)\]\]|&color\(\s*([^\),]+)\s*(?:,\s*([^\),]+))?\)\{(.*?)\};|&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);?/giu

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
            last = m.index + token.length
        }
        // #DATEDIF(d1,d2,unit)
        else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #DATEVALUE(str)
        else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #comment
        else if (token === '#comment') {
            nodes.push(<CommentForm key={key} />)
            last = m.index + token.length
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
            last = m.index + token.length
        }
        // #hr
        else if (token === '#hr') {
            nodes.push(<hr key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('#br')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('&br;')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        // #ls([title])
        else if (token.startsWith('#ls')) {
            const prefix = safeTrim(m[8]) || undefined
            nodes.push(<PageList key={key} prefix={prefix} />)
            last = m.index + token.length
        }
        // #ls2(pattern[,…][,…][,…])
        else if (token.startsWith('#ls2')) {
            // m[9] = パターン (例: 'Foo/')
            // m[10] = [オプションリスト]
            // m[11] = {include,...} ブロック型オプション
            // m[12] = 表示用ラベル
            const pattern = safeTrim(m[9])
            const opts = m[10]?.split(',').map(s => safeTrim(s)) ?? []
            const blockOpts = m[11]?.split(',').map(s => safeTrim(s)) ?? []
            const label = safeTrim(m[12])

            nodes.push(
                <PageList2
                    key={key}
                    wikiSlug={wikiSlug}
                    pattern={pattern}
                    options={[...opts, ...blockOpts]}
                    label={label}
                />
            )
            last = m.index + token.length
        }
        // #include(pageName|css,flag)
        else if (token.startsWith('#include')) {
            const arg = safeTrim(m[13]!)
            const parts = arg.split(',').map(s => safeTrim(s))
            const [first, lineRange, flag] = parts

            let showTitle: boolean | undefined
            if (flag === 'notitle') showTitle = false
            else if (flag === 'none') showTitle = false
            else if (flag === 'title') showTitle = true

            let pageName = first
            let stylesheetURL: string | undefined
            if (first.includes('|')) {
                const [name, css] = first.split('|', 2).map(s => safeTrim(s))
                pageName = name
                stylesheetURL = css
            }

            if (lineRange && !isValidLineRange(lineRange)) {
                nodes.push(
                    <div key={key} style={{ color: 'red' }}>
                    読み込み失敗: 無効な行範囲です（format: 1-5, 3-, -4 など）
                    </div>
                )
                continue
            }
            nodes.push(
                <IncludePage
                    key={key}
                    wikiSlug={wikiSlug}
                    page={pageName}
                    showTitle={showTitle}
                    stylesheetURL={stylesheetURL}
                    lineRange={lineRange}
                />
            )
            last = m.index + token.length
        }
        // #contents
        else if (token === '#contents') {
            nodes.push(<TableOfContents key={key} />)
            last = m.index + token.length
        }
        // CENTER:
        else if (m[14]) {
            const centered = safeTrim(m[14]);
            const contents = parseOtherInline(centered, wikiSlug, pageSlug, baseKey + 1)
            nodes.push(
                <div key={key} style={{ textAlign: 'center' }}>
                    {contents}
                </div>
            )
            last = m.index + token.length
        }
        // LEFT:
        else if (m[15]) {
            const inner = parseOtherInline(m[15], wikiSlug, pageSlug, baseKey + 1)
            nodes.push(<div key={key} style={{ textAlign: 'left' }}>{inner}</div>)
            last = m.index + token.length
        }
        // RIGHT:
        else if (m[16]) {
            const inner = parseOtherInline(m[16], wikiSlug, pageSlug, baseKey + 1)
            nodes.push(<div key={key} style={{ textAlign: 'right' }}>{inner}</div>)
            last = m.index + token.length
        }
        else if (token.startsWith('&size(')) {
            const sizeStart = token.indexOf('(')
            const braceStart = token.indexOf('{', sizeStart)
            const braceBlock = extractBracedBlock(token, braceStart)
            const fontSize = parseInt(token.slice(sizeStart + 1, braceStart - 1), 10)
            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, baseKey + 1)
            nodes.push(
                <span key={key} style={{ fontSize: `${fontSize}px` }}>
                    {content}
                </span>
            )
            last = m.index + braceStart + braceBlock.end
        }
        else if (token.startsWith('&color(')) {
            const braceStart = token.indexOf('{')
            const braceBlock = extractBracedBlock(token, braceStart)

            const args = token.slice(7, braceStart).split(',').map(s => safeTrim(s))
            const color = args[0] || undefined
            const background = args[1] || undefined

            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, baseKey + 1)
            nodes.push(
            <span
                key={key}
                style={{
                ...(color ? { color } : {}),
                ...(background ? { backgroundColor: background } : {}),
                }}
            >
                {Array.isArray(content) ? content : [content]}
            </span>
            )

            last = m.index + braceStart + braceBlock.end
            continue
        }
        else if (token.startsWith('[[')) {
            const plainLink = token.match(/\[\[([^\]]+)\]\]/)
            const labeledLink = token.match(/\[\[([^\]>]+)>([^\]]+)\]\]/)
            if (labeledLink) {
                const label = labeledLink[1].trim()
                const url = labeledLink[2].trim()
                const inner = parseOtherInline(label, wikiSlug, pageSlug, baseKey + 1)
                nodes.push(<a key={key} href={url}>{inner}</a>)
                last = m.index + token.length // ✅ここを追加
                continue
            } else if (plainLink) {
                const url = plainLink[1].trim()
                nodes.push(
                    <a key={key} href={url}>
                        {url}
                    </a>
                )
            } else {
                nodes.push(token) // 解析できなかった場合はそのまま表示
            }
            last = m.index + token.length
        }
        else if (token.startsWith('&attachref(')) {
            const match = token.match(/&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);?/)
            if (match) {
                const url = match[1].trim()
                const width = parseInt(match[2], 10)
                const height = parseInt(match[3], 10)
                nodes.push(
                    <img key={key} src={url} width={width} height={height} alt={url} />
                )
            } else {
                nodes.push(token)
            }
            last = m.index + token.length
        }
    }

    // 最後に残ったテキスト
    if (last < line.length) {
        const rest = line.slice(last)
        const splitByEscapedNewline = rest.split(/\\n/)  // ←ここが肝心

        for (let i = 0; i < splitByEscapedNewline.length; i++) {
            nodes.push(splitByEscapedNewline[i])
            if (i < splitByEscapedNewline.length - 1) {
                nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />)
            }
        }
    }
    return nodes
}

    /**
     * アコーディオンとインラインプラグインを再帰的にパースするメイン関数
     */
    export function parseWikiContent(content: string, context: Context): React.ReactNode[] {
        const nodes: React.ReactNode[] = [];

        // 1. アコーディオンを先に抜き出す
        const blocks = extractAccordions(content);
        if (blocks.length > 0) {
            blocks.forEach((blk, idx) => {
                if (blk.prefix) {
                    nodes.push(...parseWikiContentFragment(blk.prefix, context));
                }
                if (blk.title) {
                    const children = parseWikiContent(blk.body!, context); // 再帰的に中身を処理
                    nodes.push(
                        <Accordion
                            key={`acc-${idx}`}
                            title={blk.title!}
                            level={blk.level!}
                            initiallyOpen={blk.isOpen!}
                        >
                            {children}
                        </Accordion>
                    );
                }
            });
            return nodes;
        }
        // 2. アコーディオンがなかった場合に sel_container を処理
        return parseWikiContentFragment(content, context);
    }

    function extractSelContainers(content: string): { body: string; start: number; end: number }[] {
        const results: { body: string; start: number; end: number }[] = [];
        const startTag = '#sel_container{{';
        let pos = 0;

        while (pos < content.length) {
            const startIdx = content.indexOf(startTag, pos);
            if (startIdx === -1) break;

            let braceLevel = 0;
            let endIdx = -1;

            for (let i = startIdx + startTag.length; i < content.length; i++) {
                if (content.slice(i, i + 2) === '{{') {
                    braceLevel++;
                    i++;
                } else if (content.slice(i, i + 2) === '}}') {
                    if (braceLevel === 0) {
                        endIdx = i;
                        break;
                    } else {
                        braceLevel--;
                        i++;
                    }
                }
            }

            if (endIdx !== -1) {
                const body = content.slice(startIdx + startTag.length, endIdx).trim();
                results.push({ body, start: startIdx, end: endIdx + 2 }); // include closing braces
                pos = endIdx + 2;
            } else {
                // 閉じタグが見つからなかった
                break;
            }
        }

        return results;
    }
    
    function parseWikiContentFragment(content: string, context: Context): React.ReactNode[] {
        const nodes: React.ReactNode[] = [];
        const containers = extractSelContainers(content);

        let lastIndex = 0;

        for (const { body: containerBody, start, end } of containers) {
            // 前のテキストを処理
            const before = content.slice(lastIndex, start);
            nodes.push(...parseInline(before, context));

            const rowRe = /#sel_row\s*\{\{([\s\S]*?)\}\}/g;
            const rowItems: React.ReactNode[] = [];
            let rowMatch: RegExpExecArray | null;

            while ((rowMatch = rowRe.exec(containerBody))) {
                const rowBody = rowMatch[1];

                const contentRe = /&sel_content(?:\(([^)]*)\))?\{([\s\S]*?)\};?/g;
                const selContents: React.ReactNode[] = [];
                let contentMatch: RegExpExecArray | null;

                while ((contentMatch = contentRe.exec(rowBody))) {
                    const [, type, inner] = contentMatch;
                    selContents.push(
                        <SelContent key={`sel-${start}-${rowMatch.index}-${contentMatch.index}`} type={type?.trim() || ''}>
                            {inner.trim()}
                        </SelContent>
                    );
                }

                rowItems.push(<SelRow key={`sel-row-${start}-${rowMatch.index}`}>{selContents}</SelRow>);
            }

            nodes.push(<SelContainer key={`sel-container-${start}`}>{rowItems}</SelContainer>);
            lastIndex = end;
        }

        // 残りを処理
        const rest = content.slice(lastIndex);
        nodes.push(...parseInline(rest, context));

        return nodes;
    }

/** Accordion コンポーネント */
function Accordion({ title, level, initiallyOpen, children, }: { title: string; level: '*' | '**' | '***'; initiallyOpen: boolean; children: React.ReactNode; }) {
    const router = useRouter()
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const [open, setOpen] = useState(initiallyOpen)
    const Tag = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const designColor = useDesignColor(wikiSlugStr);
    const iconPath = open
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7c24-24 c24s-24-10.7-24-24z'
    const commonsStyle: React.CSSProperties = level === '*'
    ? (
        {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
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
            cursor: 'pointer'
        }
    )
    : level === '**' ?
        (
            {
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
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
                cursor: 'pointer'
            }
        )
    : (
        {
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
        }
    )
    const headingStyle: React.CSSProperties = level === '*'
    ? (
        designColor === 'pink' ? {
            backgroundColor: '#fad6e7',
            borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
            borderRight: '1px solid #ea94bc',
            borderTop: '1px solid #ea94bc'
        } : designColor === 'blue' ? {
            backgroundColor: '#cce3f8',
            borderColor: 'currentcolor currentcolor #86b8e2 #86b8e2',
            borderRight: '1px solid #86b8e2',
            borderTop: '1px solid #86b8e2'
        } : designColor === 'yellow' ? {
            backgroundColor: '#feeaa4',
            borderColor: 'currentcolor currentcolor #fdd341 #fdd341',
            borderRight: '1px solid #fdd341',
            borderTop: '1px solid #fdd341'
        } : {
            backgroundColor: '#d1f0a0',
            borderColor: 'currentcolor currentcolor #afd965 #afd965',
            borderRight: '1px solid #afd965',
            borderTop: '1px solid #afd965'
        }
    )
    : level === '**' ?
        (
            designColor === 'pink'
            ? {
                borderColor: '#ea94bc'
            } : designColor === 'blue' ? {
                borderColor: '#86b8e2'
            } : designColor === 'yellow' ? {
                borderColor: '#fdd341'
            } : {
                borderColor: '#afd965'
            }
        )
    : (
        designColor === 'pink' ?
        {
            borderLeft: '15px solid #ea94bc'
        } : designColor === 'blue' ? {
            borderLeft: '15px solid #86b8e2'
        } : designColor === 'yellow' ? {
            borderLeft: '15px solid #fdd341'
        } : {
            borderLeft: '15px solid #afd965'
        }
    )

    return (
        <div style={{ margin: '1em 0' }}>
        <Tag onClick={() => setOpen(!open)} style={{...commonsStyle,...headingStyle}}>
            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '1em', height: '1em' }}>
            <path fill="currentColor" d={iconPath} />
            </svg>
            {title}
        </Tag>
        {open && <div style={{ paddingLeft: '1em', }}>{children}</div>}
        </div>
    )
}

/** Header コンポーネント */
function Header({ title, level, }: { title: string; level: '*' | '**' | '***'; }) {
    const router = useRouter()
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const Tag = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4';
    const designColor = useDesignColor(wikiSlugStr);
    const commonsStyle: React.CSSProperties = level === '*'
    ? (
        {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
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
        }
    )
    : level === '**' ?
        (
            {
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
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
            }
        )
    : (
        {
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
        }
    )
    const headingStyle: React.CSSProperties = level === '*'
    ? (
        designColor === 'pink' ? {
            backgroundColor: '#fad6e7',
            borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
            borderRight: '1px solid #ea94bc',
            borderTop: '1px solid #ea94bc'
        } : designColor === 'blue' ? {
            backgroundColor: '#cce3f8',
            borderColor: 'currentcolor currentcolor #86b8e2 #86b8e2',
            borderRight: '1px solid #86b8e2',
            borderTop: '1px solid #86b8e2'
        } : designColor === 'yellow' ? {
            backgroundColor: '#feeaa4',
            borderColor: 'currentcolor currentcolor #fdd341 #fdd341',
            borderRight: '1px solid #fdd341',
            borderTop: '1px solid #fdd341'
        } : {
            backgroundColor: '#d1f0a0',
            borderColor: 'currentcolor currentcolor #afd965 #afd965',
            borderRight: '1px solid #afd965',
            borderTop: '1px solid #afd965'
        }
    )
    : level === '**' ?
        (
            designColor === 'pink'
            ? {
                borderColor: '#ea94bc'
            } : designColor === 'blue' ? {
                borderColor: '#86b8e2'
            } : designColor === 'yellow' ? {
                borderColor: '#fdd341'
            } : {
                borderColor: '#afd965'
            }
        )
    : (
        designColor === 'pink' ?
        {
            borderLeft: '#ea94bc'
        } : designColor === 'blue' ? {
            borderLeft: '#86b8e2'
        } : designColor === 'yellow' ? {
            borderLeft: '#fdd341'
        } : {
            borderLeft: '#afd965'
        }
    )

    return (
        <div style={{ margin: '1em 0' }}>
            <Tag style={{...commonsStyle, ...headingStyle}}>
                {title}
            </Tag>
        </div>
    )
}
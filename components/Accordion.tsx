import { useRouter } from "next/router";
import { useState } from "react";
import { useDesignColor } from "@/utils/parsePlugins";

/**
 * ネスト可能なアコーディオンブロックを文字列から抽出します
 */
export function extractAccordions(content: string) {
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

/** Accordion コンポーネント */
export default function Accordion({ title, level, initiallyOpen, children, }: { title: string; level: '*' | '**' | '***'; initiallyOpen: boolean; children: React.ReactNode; }) {
    const router = useRouter()
    const { wikiSlug } = router.query;
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
            <div style={{ paddingLeft: '1em', display: open ? 'block' : 'none'}}>{children}</div>
        </div>
    )
}
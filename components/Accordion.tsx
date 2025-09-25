import { NextRouter, useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { useDesignColor, parseWikiContent, extractBracedBlock } from "@/utils/parsePlugins";
import { AccordionBlock, Context } from "./parsePluginTypes";

/**
 * ネスト可能なアコーディオンブロックを文字列から抽出します
*/
export async function extractAccordions(
    content: string,
    offset:number = 0,
    context: Context
): Promise<AccordionBlock[]> {
    console.log(
        '▶ extractAccordions called.',
        { offset, snippet: content.slice(0, 60).replace(/\n/g, '⏎') }
    );

    // ② 強化した正規表現
    const accRe:RegExp = /#accordion\s*(?:\(\s*([^)]*?)\s*\)|\s+([^{]+?))\s*\{/gm;

    const blocks: AccordionBlock[] = [];
    let m: RegExpExecArray | null;

    while ((m = accRe.exec(content))) {
        const start = m.index;

        // タイトル／オプション解釈
        const raw:string = (m[1] || m[2] || '').trim();
        const args:string[] = raw.split(',').map(s => s.trim());
        const title:string = args[0];
        const level:'*'|'**'|'***' =
        (args.find(a => /^(?:\*{1,3})$/.test(a)) as '*' | '**' | '***') ?? '*';
        const isOpen:boolean = args.includes('open');

        // 単一「{」マッチを想定
        const braceCount:number = 1;
        const braceStart:number = accRe.lastIndex - braceCount;

        // ④ 本文抜き出し
        const { body, end } = extractBracedBlock(
            content,
            braceStart,
            braceCount
        );
        if (!body) {
            console.warn(`⚠ extractBracedBlock failed at ${braceStart}`);
            continue;
        }

        // ⑤ ネスト再帰
        const children:AccordionBlock[] = await extractAccordions(body, offset + braceStart, context);

        // ⑥ inline 用にマスク
        let bodyForInline:string = body;
        for (const child of children) {
            const relStart = child.start! - offset - braceStart;
            const relEnd = child.end! - offset - braceStart;
            bodyForInline =
                bodyForInline.slice(0, relStart) +
                ' '.repeat(relEnd - relStart) +
                bodyForInline.slice(relEnd);
        }
        const parsedBody:ReactNode[] = await parseWikiContent(
            bodyForInline,
            context
        );

        blocks.push({
            prefix: content.slice(
                blocks.length ? blocks[blocks.length - 1].end! - offset : 0,
                start
            ),
            title,
            level,
            isOpen,
            body,
            bodyNode: parsedBody,
            start: offset + start,
            end: offset + end,
            children,
        });

        console.log(`  🪗 block #${blocks.length - 1}:`, {
            title,
            start: offset + start,
            end: offset + end,
            childCount: children.length,
        });

        // 次の検索スタート位置をマニュアルで更新しても OK
        accRe.lastIndex = end;
    }

    console.log(
        `=> extractAccordions returning ${blocks.length} blocks at offset=${offset}`
    );
    return blocks;
}

/** Accordion コンポーネント */
export default function Accordion({ title, level, initiallyOpen, children, }: { title: string; level: '*' | '**' | '***'; initiallyOpen: boolean; children: React.ReactNode; }) {
    const router:NextRouter = useRouter()
    const { wikiSlug } = router.query;
    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const [open, setOpen] = useState(initiallyOpen)
    const Tag:'h2'|'h3'|'h4' = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const designColor:"pink" | "blue" | "yellow" | "default" | null = useDesignColor(wikiSlugStr);
    const iconPath:string = open
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
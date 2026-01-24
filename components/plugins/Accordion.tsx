import { NextRouter, useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { useDesignColor, parseWikiContent, extractBracedBlock } from "@/utils/parsePlugins";
import { AccordionBlock, Context } from "@/components/plugins/parsePluginTypes";
import type { designColor, headerLevel } from "@/utils/wiki_settings";

interface AccordionProps{
    title: string;
    level: headerLevel;
    initiallyOpen: boolean;
    children: React.ReactNode;
}

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
        const level:headerLevel =
        (args.find(a => /^(?:\*{1,3})$/.test(a)) as headerLevel) ?? '*';
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
export default function Accordion({ title, level, initiallyOpen, children, }: AccordionProps) {
    const router:NextRouter = useRouter()
    const { wikiSlug } = router.query;
    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const [open, setOpen] = useState(initiallyOpen)
    const Tag:'h2'|'h3'|'h4' = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
    const designColor:designColor | null = useDesignColor(wikiSlugStr);
    const iconPath:string = open
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7c24-24 c24s-24-10.7-24-24z'
    return (
        <div className="accordion-container">
            <Tag onClick={() => setOpen(!open)} className={`accordion-header header_${designColor}`}>
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '1em', height: '1em' }}>
                    <path fill="currentColor" d={iconPath} />
                </svg>
                {title}
            </Tag>
            <div style={{ display: open ? 'block' : 'none' }} className="accordion-content">{children}</div>
        </div>
    )
}
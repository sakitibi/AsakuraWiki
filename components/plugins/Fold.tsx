import React, { ReactNode, useState } from "react";
import { FoldBlock, Context } from "@/components/plugins/parsePluginTypes";
import { extractBracedBlock, parseWikiContent } from "@/utils/parsePlugins";

interface FoldProps{
    title: React.ReactNode;
    initiallyOpen: boolean;
    children: React.ReactNode;
}

export async function extractFolds(
    content: string,
    offset:number = 0,
    context: Context
): Promise<FoldBlock[]> {
    console.log(
        '▶ extractFolds called.',
        { offset, snippet: content.slice(0, 60).replace(/\n/g, '⏎') }
    );

    // ② 強化した正規表現
    const foldRe:RegExp = /#fold\((.*?)\)\s*\{\{/g;

    const blocks: FoldBlock[] = [];
    let m: RegExpExecArray | null;

    while ((m = foldRe.exec(content))) {
        const start = m.index;

        // タイトル／オプション解釈
        const raw:string = (m[1] || m[2] || '').trim();
        const args:string[] = raw.split(',').map(s => s.trim());
        const title:string = args[0];
        const isOpen:boolean = args.includes('openFolds');

        // 単一「{」マッチを想定
        const braceCount:number = 1;
        const braceStart:number = foldRe.lastIndex - braceCount;

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
        const children:FoldBlock[] = await extractFolds(body, offset + braceStart, context);

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
        foldRe.lastIndex = end;
    }

    console.log(
        `=> extractAccordions returning ${blocks.length} blocks at offset=${offset}`
    );
    return blocks;
}

export default function Fold({ title, initiallyOpen, children }: FoldProps){
    const [open, setOpen] = useState(initiallyOpen);
    const iconPath = open
        ? "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM128 240l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
        : "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM208 352l0-80-80 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l80 0 0-80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 80 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-80 0 0 80c0 8.8-7.2 16-16 16s-16-7.2-16-16z";
    return(
        <div style={{ margin: '0px 0px' }}>
            <button onClick={() => setOpen(!open)} type="button" className="fold-button" style={{
                backgroundColor: 'initial',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                display: 'block',
                float: 'left',
                fontSize: '22px',
                lineHeight: '1em',
                margin: '-1px 0',
                padding: '0'
            }}>
                <svg style={{ height: '1em', verticalAlign: '-0.125em' }} aria-hidden="true" focusable="false"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path fill="currentColor" d={iconPath}></path>
                </svg>
            </button>
            <div style={{ display: open ? 'none' : 'block', marginLeft: '28px' }}>{title}</div>
            <div style={{ display: open ? 'block' : 'none', marginLeft: '28px' }}>{children}</div>
        </div>
    );
}
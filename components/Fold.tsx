import React, { useState } from "react";
import parseInline from "@/components/ParseInline";
import { FoldBlock, Context } from "@/components/parsePluginTypes";

interface FoldProps{
    title: React.ReactNode;
    initiallyOpen: boolean;
    children: React.ReactNode;
}

export function extractFolds(content: string, context: Context, offset = 0, depth = 0): FoldBlock[] {
    console.log("🔥 extractFolds called at depth", depth);
    const MAX_DEPTH = 100;
    if (depth > MAX_DEPTH) {
        console.error("⛔ 再帰深度上限に達したため打ち切ります\n#accordionなどの別プラグインをご利用ください");
        return [];
    }

    const blocks: FoldBlock[] = [];
    const foldRe:RegExp = /#fold\((.*?)\)\s*\{\{/g;
    const matches:RegExpMatchArray[] = Array.from(content.matchAll(foldRe));
    let cursor:number = 0;

    for (const m of matches) {
        const startLocal:number = m.index!;
        const startGlobal:number = offset + startLocal;
        const foldHeader:string = m[1];

        const lastCommaIndex:number = foldHeader.lastIndexOf(',');
        if (lastCommaIndex === -1) continue;

        const titleRaw:string = foldHeader.slice(0, lastCommaIndex).trim();
        const optionStr:string = foldHeader.slice(lastCommaIndex + 1).trim();
        const isOpen:boolean = optionStr.includes('open');
        if (!titleRaw || !titleRaw.match(/\S/)) continue;

        const parsedTitleNodes:React.ReactNode[] = parseInline({ text: titleRaw, context});

        const foldOpenEndLocal:number = content.indexOf("{{", startLocal) + 2;
        let iLocal:number = foldOpenEndLocal;
        let depthCount:number = 1;
        while (iLocal < content.length && depthCount > 0) {
            const two = content.slice(iLocal, iLocal + 2);
            if (two === '{{') {
                depthCount++; iLocal += 2;
            } else if (two === '}}') {
                depthCount--; iLocal += 2;
            } else {
                iLocal++;
            }
        }

        if (depthCount !== 0 || iLocal > content.length) continue;

        const bodyStart:number = foldOpenEndLocal;
        const bodyEnd:number = iLocal - 2; // 👈 ここで閉じ `}}` を除外
        const body:string = bodyEnd >= bodyStart ? content.slice(bodyStart, bodyEnd) : '';

        if (!body.trim() && !body.includes('#fold(')) continue;
        if (depth === 0 && body.trim() === content.trim()) continue;

        const childFolds:FoldBlock[] = extractFolds(body, context, 0, depth + 1);
        const prefix:string = content.slice(cursor, startLocal);
        const trimmedPrefix:string = prefix.trim();

        if (!trimmedPrefix.match(/^\s*}}+\s*$/)) {
            blocks.push({
                prefix,
                title: <>{parsedTitleNodes.map((n, i) => <React.Fragment key={i}>{n}</React.Fragment>)}</>,
                body,
                isOpen,
                start: startGlobal,
                end: offset + iLocal,
                children: body.includes('#fold(') ? childFolds : []
            });
        }

        cursor = iLocal;
    }

    if (depth === 0 && cursor < content.length) {
        const tail:string = content.slice(cursor);
        const trimmedTail:string = tail.trim();
        if (!trimmedTail.match(/^\s*}}+\s*$/)) {
            blocks.push({
                prefix: tail,
                body: '',
                title: <></>,
                isOpen: false,
                start: offset + cursor,
                end: offset + content.length,
                children: []
            });
        }
    }

    return blocks;
}

export default function Fold({ title, initiallyOpen, children }: FoldProps){
    const [open, setOpen] = useState(initiallyOpen);
    const iconPath = open
        ? "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM128 240l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
        : "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM208 352l0-80-80 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l80 0 0-80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 80 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-80 0 0 80c0 8.8-7.2 16-16 16s-16-7.2-16-16z";
    return(
        <div style={{ margin: '8px 0' }}>
            <button onClick={() => setOpen(!open)} type="button" style={{
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
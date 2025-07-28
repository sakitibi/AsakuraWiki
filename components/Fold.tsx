import { useState } from "react";
import parseInline from "@/components/ParseInline";
import { FoldBlock, Context } from "@/utils/parsePlugins";

export function extractFolds(content: string, context: Context, offset = 0): FoldBlock[] {
    const blocks: FoldBlock[] = [];
    const blockRe = /(?:#fold\(([^)]*?)\)|\(([^)]*?)\))\s*\{\{/g;

    let cursor = 0;
    while (cursor < content.length) {
        blockRe.lastIndex = cursor;
        const m = blockRe.exec(content);
        if (!m) break;

        const start = m.index;
        const argsStr = m[1] ?? m[2];
        const args = argsStr.split(',').map(s => s.trim());
        const titleRaw = args[0] ?? '項目';
        const isOpen = args.includes('open');
        const kind = m[1] ? 'fold' : 'inline'; // fold = #fold(...) / inline = (...)

        // 多段 {{ }} に対応した本文抽出
        let depth = 1;
        let i = blockRe.lastIndex;
        while (i < content.length && depth > 0) {
            const two = content.slice(i, i + 2);
            if (two === '{{') {
                depth++; i += 2;
            } else if (two === '}}') {
                depth--; i += 2;
            } else {
                i++;
            }
        }

        const prefix = content.slice(cursor, start);
        const body = content.slice(blockRe.lastIndex, i - 2);
        const end = i;

        const parsedTitle = parseInline(titleRaw, context);
        const children = extractFolds(body, context, offset + blockRe.lastIndex); // 再帰でネスト対応

        blocks.push({
            prefix,
            title: <>{parsedTitle}</>,
            body,
            isOpen,
            start: offset + start,
            end: offset + end,
            children,
            kind,
        });

        console.log(`📦 block[${blocks.length}]:`, { kind, titleRaw, isOpen, start, end });
        cursor = end;
    }

    blocks.push({ prefix: content.slice(cursor) });
    return blocks;
}

export default function Fold({
    title,
    initiallyOpen,
    children
}: {
    title: React.ReactNode;
    initiallyOpen: boolean;
    children: React.ReactNode;
}){
    const [open, setOpen] = useState(initiallyOpen)
    const iconPath = open
        ? "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM128 240l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
        : "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM208 352l0-80-80 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l80 0 0-80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 80 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-80 0 0 80c0 8.8-7.2 16-16 16s-16-7.2-16-16z";
    return(
        <div style={{ margin: '8px 0' }}>
            <button onClick={() => setOpen(!open)} style={{backgroundColor: 'initial', border: 'none', color: 'inherit', cursor: 'pointer', display: 'block', float: 'left', fontSize: '22px', lineHeight: '1em', margin: '-1px 0', padding: '0'}}>
                <svg style={{ height: '1em', verticalAlign: '-0.125em' }}aria-hidden="true" focusable="false" data-prefix="fal" data-icon="square-minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                    <path fill="currentColor" d={iconPath}></path>
                </svg>
            </button>
            <div style={{ display: open ? 'none' : 'block', marginLeft: '28px' }}>
                {title}
            </div>
            <div style={{ display: open ? 'block' : 'none', marginLeft: '28px' }}>
                {children}
            </div>
        </div>
    )
}
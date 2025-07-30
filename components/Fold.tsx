import React, { useState } from "react";
import parseInline from "@/components/ParseInline";
import { FoldBlock, Context } from "@/utils/parsePlugins";

export function renderFolds(blocks: FoldBlock[]) {
    return blocks.map((block, idx) => (
        <React.Fragment key={idx}>
            {block.prefix && <div>{block.prefix}</div>}
            {(block.title && block.body) ? (
                <Fold title={block.title} initiallyOpen={block.isOpen ?? false}>
                    <div>
                        {block.children?.length
                            ? renderFolds(block.children)
                            : block.body}
                    </div>
                </Fold>
            ) : (
                block.body && <div>{block.body}</div>
            )}
        </React.Fragment>
    ));
}

export function extractFolds(content: string, context: Context, offset = 0, depth = 0): FoldBlock[] {
    console.log("🔥 extractFolds called at depth", depth);
    const MAX_DEPTH = 100;
    if (depth > MAX_DEPTH) {
        console.error("⛔ 再帰深度上限に達したため打ち切ります\n#accordionなどの別プラグインをご利用ください、");
        return [];
    }

    const blocks: FoldBlock[] = [];
    const foldRe = /#fold\((.*?)\)\s*\{\{/g;
    const matches = Array.from(content.matchAll(foldRe));
    let cursor = 0;

    for (const m of matches) {
        const start = m.index!;
        const foldHeader = m[1];
        const lastCommaIndex = foldHeader.lastIndexOf(',');
        if (lastCommaIndex === -1) {
            console.warn("⚠️ fold にカンマが含まれていないためスキップ");
            continue;
        }

        const titleRaw = foldHeader.slice(0, lastCommaIndex).trim();
        const optionStr = foldHeader.slice(lastCommaIndex + 1).trim();
        const isOpen = optionStr.includes('open');

        if (!titleRaw || !titleRaw.match(/\S/)) {
            console.warn("🚫 titleRaw が空か無効 → fold スキップ");
            continue;
        }

        const parsedTitleNodes = parseInline(titleRaw, context);
        console.log("🪪 titleRaw:", titleRaw);
        console.log("🎨 parsedTitle:", parsedTitleNodes);

        const foldOpenEnd = content.indexOf("{{", start) + 2;
        let i = foldOpenEnd;
        let depthCount = 1;
        while (i < content.length && depthCount > 0) {
            const two = content.slice(i, i + 2);
            if (two === '{{') {
                depthCount++; i += 2;
            } else if (two === '}}') {
                depthCount--; i += 2;
            } else {
                i++;
            }
        }

        if (depthCount !== 0) {
            console.warn("⚠️ foldブロックの閉じタグ不足によりスキップ", { titleRaw, start });
            continue;
        }

        const bodyStart = foldOpenEnd;
        const bodyEnd = i - 2;
        const body = bodyEnd >= bodyStart ? content.slice(bodyStart, bodyEnd) : '';

        if (body.trim() === content.trim()) {
            console.warn("🔁 body と親 content が同一のため再帰終了");
            continue;
        }

        const childFolds = extractFolds(body, context, 0, depth + 1);

        blocks.push({
            prefix: content.slice(cursor, start),
            title: <>{parsedTitleNodes.map((node, idx) => <React.Fragment key={idx}>{node}</React.Fragment>)}</>,
            body,
            isOpen,
            start: offset + start,
            end: offset + i,
            children: Array.isArray(childFolds) ? childFolds : []
        });

        cursor = i;
    }

    if (depth === 0) {
        const tail = content.slice(cursor).trim();
        if (tail.length > 0) {
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

export default function Fold({ title, initiallyOpen, children }: {
    title: React.ReactNode;
    initiallyOpen: boolean;
    children: React.ReactNode;
}){
    const [open, setOpen] = useState(initiallyOpen);
    const iconPath = open
        ? "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7..."
        : "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7...";
    
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
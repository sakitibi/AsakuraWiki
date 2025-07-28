import { useState } from "react";
import { FoldBlock, parseInline, Context } from "@/utils/parsePlugins";

export function extractFolds(content: string, context: Context): FoldBlock[] {
        const foldRe = /#fold\(([^)]*?)\)\s*\{\{([\s\S]*?)\}\}/g;
        const blocks: FoldBlock[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = foldRe.exec(content)) !== null) {
            const [full, rawArgs, body] = match;
            const args = rawArgs.split(',').map(s => s.trim());
            const titleRaw = args[0];
            const isOpen = args.includes('open');

            const parsedTitle = parseInline(titleRaw, context);
            const start = match.index;
            const end = start + full.length;

            blocks.push({
                prefix: content.slice(lastIndex, start),
                title: <>{parsedTitle}</>,
                body: body.trim(),
                isOpen,
                start,
                end,
            });

            console.log(`📁 fold[${blocks.length}]:`, {
                titleRaw, isOpen, start, end, body,
            });

            lastIndex = end;
        }

        blocks.push({ prefix: content.slice(lastIndex) });
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
import { useState } from "react";
import type { designColor, headerLevel } from "@/utils/wiki_settings";

interface AccordionProps{
    title: string;
    level: headerLevel;
    initiallyOpen: boolean;
    children: React.ReactNode;
    designColor?: designColor;
}

/** Accordion コンポーネント */
export default function Accordion({ title, level, initiallyOpen, children, designColor }: AccordionProps) {
    const [open, setOpen] = useState(initiallyOpen)
    const Tag:'h2'|'h3'|'h4' = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4'
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
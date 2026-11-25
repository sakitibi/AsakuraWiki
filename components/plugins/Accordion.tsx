import { useState, useEffect, useRef } from "react";
import type { designColor, headerLevel } from "@/utils/wiki/wiki_settings";

interface AccordionProps {
    title: string;
    level: headerLevel;
    initiallyOpen: boolean;
    children: React.ReactNode;
    designColor?: designColor;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Accordion コンポーネント */
export default function Accordion({ title, level, initiallyOpen, children, designColor }: AccordionProps) {
    const [open, setOpen] = useState(initiallyOpen);
    const [isTargetOpen, setIsTargetOpen] = useState(initiallyOpen);
    const [isAnimating, setIsAnimating] = useState(false);

    const progressRef = useRef(initiallyOpen ? 1 : 0);
    const isFirstRender = useRef(true);
    
    const contentRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    
    const maxHeightRef = useRef<number>(100);

    const Tag: 'h2' | 'h3' | 'h4' = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4';
    
    const iconPath: string = open
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z';

    useEffect(() => {
        if (innerRef.current) {
            const h = innerRef.current.scrollHeight;
            if (h > 0) maxHeightRef.current = h;
        }
    }, [children]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const duration = 500;
        const startProgress = progressRef.current;
        const targetProgress = isTargetOpen ? 1 : 0;
        const distance = targetProgress - startProgress;

        if (distance === 0) return;

        if (innerRef.current) {
            const h = innerRef.current.scrollHeight;
            if (h > 0) {
                maxHeightRef.current = h;
            }
        }
        const maxHeight = maxHeightRef.current;

        setIsAnimating(true);
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            const timeRatio = Math.min(elapsed / duration, 1);
            const easedRatio = easeInOutCubic(timeRatio);
            const currentProgress = startProgress + distance * easedRatio;

            progressRef.current = currentProgress;

            if (contentRef.current) {
                contentRef.current.style.overflow = "hidden";
                contentRef.current.style.height = `${(currentProgress * maxHeight).toFixed(4)}px`;
                contentRef.current.style.paddingTop = `${(currentProgress * 10).toFixed(5)}px`;
                contentRef.current.style.marginTop = "0px";
                contentRef.current.style.paddingBottom = "0px";
                contentRef.current.style.marginBottom = "0px";
            }

            if (timeRatio < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                progressRef.current = targetProgress;
                
                if (contentRef.current) {
                    contentRef.current.removeAttribute("style");
                }
                
                setOpen(isTargetOpen);
                setIsAnimating(false);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isTargetOpen]);

    function openClick() {
        setIsTargetOpen(!isTargetOpen);
    }

    const shouldHide = !open && !isAnimating;

    return (
        <div className="accordion-container">
            <Tag onClick={openClick} className={`accordion-header header_${designColor}`}>
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '1em', height: '1em' }}>
                    <path fill="currentColor" d={iconPath} />
                </svg>
                {title}
            </Tag>
            <div
                ref={contentRef}
                className={`accordion-content ${open ? "accordion-open" : ""}`}
                style={shouldHide ? { display: "none" } : undefined}
            >
                <div className="accordion-content-inner" ref={innerRef}>
                    {children}
                </div>
            </div>
        </div>
    );
}
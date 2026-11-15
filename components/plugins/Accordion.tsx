import { useState, useEffect, useRef } from "react";
import type { designColor, headerLevel } from "@/utils/wiki_settings";

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

    const [progress, setProgress] = useState(initiallyOpen ? 1 : 0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const progressRef = useRef(initiallyOpen ? 1 : 0);
    const isFirstRender = useRef(true);
    
    const innerRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState(100);

    const Tag: 'h2' | 'h3' | 'h4' = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4';
    
    const iconPath: string = open
        ? 'M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM320 272H128c-13.3 0-24-10.7-24-24s10.7-24 24-24h192c13.3 0 24 10.7 24 24s-10.7 24-24 24z'
        : 'M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z';

    useEffect(() => {
        if (innerRef.current) {
            setMaxHeight(innerRef.current.offsetHeight);
        }
    }, [children]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const duration = 600;
        const startProgress = progressRef.current;
        const targetProgress = isTargetOpen ? 1 : 0;
        const distance = targetProgress - startProgress;

        if (distance === 0) return;

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
            setProgress(currentProgress);

            if (timeRatio < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                progressRef.current = targetProgress;
                setProgress(targetProgress);
                setIsAnimating(false);
                
                setOpen(isTargetOpen);
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

    const currentHeight = `${(progress * maxHeight).toFixed(4)}px`;
    const currentPaddingTop = `${(progress * 10).toFixed(5)}px`;

    return (
        <div className="accordion-container">
            <Tag onClick={openClick} className={`accordion-header header_${designColor}`}>
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '1em', height: '1em' }}>
                    <path fill="currentColor" d={iconPath} />
                </svg>
                {title}
            </Tag>
            <div
                className={`accordion-content ${open ? "accordion-open" : ""}`}
                {...(isAnimating ? {
                    style: {
                        display: "block",
                        overflow: "hidden",
                        height: currentHeight,
                        paddingTop: currentPaddingTop,
                        marginTop: "0px",
                        paddingBottom: "0px",
                        marginBottom: "0px",
                    }
                } : {})}
            >
                <div className="accordion-content-inner" ref={innerRef}>
                    {children}
                </div>
            </div>
        </div>
    );
}
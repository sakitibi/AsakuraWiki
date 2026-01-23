import { NextRouter, useRouter } from "next/router";
import { useDesignColor } from "@/utils/parsePlugins";

/** Header コンポーネント */
export default function Header({ title, level, anchor }: { title: string; level: '*' | '**' | '***'; anchor: string}) {
    const router:NextRouter = useRouter()
    const { wikiSlug } = router.query;
    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const Tag:"h2" | "h3" | "h4" = level === '*' ? 'h2' : level === '**' ? 'h3' : 'h4';
    const designColor:string | null = useDesignColor(wikiSlugStr);
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
            }
        )
    : (
        {
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
        } : designColor === 'purple' ? {
            backgroundColor: '#e9d7f3',
            borderColor: 'currentcolor currentcolor #ceb0e0 #ceb0e0',
            borderRight: '1px solid #ceb0e0',
            borderTop: '1px solid #ceb0e0'
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
            } : designColor === 'purple' ? {
                borderColor: '#ceb0e0'
            } : {
                borderColor: '#afd965'
            }
        )
    : (
        designColor === 'pink' ?
        {
            borderLeft: '#ea94bc'
        } : designColor === 'blue' ? {
            borderLeft: '#86b8e2'
        } : designColor === 'yellow' ? {
            borderLeft: '#fdd341'
        } : designColor === 'yellow' ? {
            borderLeft: '#ceb0e0'
        } : {
            borderLeft: '#afd965'
        }
    )

    return (
        <div style={{ margin: '1em 0', marginBottom: '10px' }}>
            <Tag style={{...commonsStyle, ...headingStyle}}>
                {title}
                <a id={`${anchor}`} style={{display: 'none'}}></a>
                <a href={`#${anchor}`} style={{opacity: '.2', position: 'absolute', right: '8px'}}>
                    <svg className="svg-inline--fa fa-link" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg="" width="16.25" height="13">
                        <path fill="currentColor" d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"></path>
                    </svg>
                </a>
            </Tag>
        </div>
    )
}
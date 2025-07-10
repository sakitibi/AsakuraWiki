import React from 'react';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let designColor: 'pink' | 'blue' | 'yellow' | 'default' | null = null;

async function fetchDesignColor() {
    const { data, error } = await supabase
        .from('wikis')
        .select('design_color')
        .limit(1)
        .single();

    if (error) {
        console.error('データ取得エラー:', error);
        return null;
    }

    return data.design_color;
}

(async function () {
    designColor = await fetchDesignColor();
    console.log('取得したデザインカラー:', designColor);
})();

type SelContentProps = {
    type: string;
    children: React.ReactNode;
};

export default function SelContent({ type, children }: SelContentProps) {
    const commonsStyle: React.CSSProperties = {
        border: '1px solid #a9a9a9',
        color: 'inherit',
        margin: '1px',
        padding: '3px'
    }
    const headingStyle: React.CSSProperties = type === 'header' || type === 'subheader' || type === 'miniheader'
    ? (
        designColor === 'pink' ? {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
            backgroundColor: '#fad6e7',
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
            borderColor: 'currentcolor currentcolor #ea94bc #ea94bc',
            borderRight: '1px solid #ea94bc',
            borderTop: '1px solid #ea94bc',
        } : designColor === 'blue' ? {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
            backgroundColor: '#cce3f8',
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
            borderColor: 'currentcolor currentcolor #86b8e2 #86b8e2',
            borderRight: '1px solid #86b8e2',
            borderTop: '1px solid #86b8e2',
        } : designColor === 'yellow' ? {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
            backgroundColor: '#feeaa4',
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
            borderColor: 'currentcolor currentcolor #fdd341 #fdd341',
            borderRight: '1px solid #fdd341',
            borderTop: '1px solid #fdd341',
        } : {
            color: '#000',
            margin: '.2em 0 .5em',
            padding: '.3em .3em .15em .5em',
            backgroundColor: '#d1f0a0',
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
            borderColor: 'currentcolor currentcolor #afd965 #afd965',
            borderRight: '1px solid #afd965',
            borderTop: '1px solid #afd965',
        }
    )
    : type === 'subheader' ?
        (
            designColor === 'pink'
            ? {
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
                borderColor: '#ea94bc',
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
            } : designColor === 'blue' ? {
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
                borderColor: '#86b8e2',
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
            } : designColor === 'yellow' ? {
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
                borderColor: '#fdd341',
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
            } : {
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
                borderColor: '#afd965',
                color: '#000',
                margin: '.2em 0 .5em',
                padding: '.3em .3em .15em .5em',
            }
        )
    : (
        designColor === 'pink' ?
        {
            borderLeft: '15px solid #ea94bc',
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
        } : designColor === 'blue' ? {
            borderLeft: '15px solid #86b8e2',
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
        } : designColor === 'yellow' ? {
            borderLeft: '15px solid #fdd341',
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
        } : {
            borderLeft: '15px solid #afd965',
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
    if (type === 'header' || type === 'subheader' || type === 'miniheader') {
        const style = headingStyle; // 見出しレベルを仮に '*' に固定
        return (
            <th style={{...commonsStyle, ...headingStyle}}>{children}</th>
        );
    }

    return (
        <td className={`sel-content ${type ? `sel-${type}` : ''}`} style={commonsStyle}>
            {children}
        </td>
    );
}
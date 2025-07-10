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
        padding: '3px',
        wordWrap: 'normal',
        fontSize: '1em',
        boxSizing: 'border-box',
        lineHeight: '1.6em'
    }
    const headingStyle: React.CSSProperties = type === 'header'
    ? (
        designColor === 'pink' ? {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: '#fad6e7',
        } : designColor === 'blue' ? {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: '#cce3f8'
        } : designColor === 'yellow' ? {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: '#feeaa4'
        } : {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: '#d1f0a0'
        }
    )
    : type === 'subheader' ?
        (
            designColor === 'pink'
            ? {
                display: 'table-cell',
                verticalAlign: 'inherit',
                fontWeight: 'bold',
                unicodeBidi: 'isolate',
                backgroundColor: 'transparent',
                borderColor: '#fad6e7'
            } : designColor === 'blue' ? {
                display: 'table-cell',
                verticalAlign: 'inherit',
                fontWeight: 'bold',
                unicodeBidi: 'isolate',
                backgroundColor: 'transparent',
                borderColor: '#cce3f8'
            } : designColor === 'yellow' ? {
                display: 'table-cell',
                verticalAlign: 'inherit',
                fontWeight: 'bold',
                unicodeBidi: 'isolate',
                backgroundColor: 'transparent',
                borderColor: '#feeaa4'
            } : {
                display: 'table-cell',
                verticalAlign: 'inherit',
                fontWeight: 'bold',
                unicodeBidi: 'isolate',
                backgroundColor: 'transparent',
                borderColor: '#d1f0a0'
            }
        )
    : (
        designColor === 'pink' ?
        {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: 'transparent',
            borderLeft: '#fad6e7'
        } : designColor === 'blue' ? {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: 'transparent',
            borderLeft: '#cce3f8'
        } : designColor === 'yellow' ? {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: 'transparent',
            borderLeft: '#feeaa4'
        } : {
            display: 'table-cell',
            verticalAlign: 'inherit',
            fontWeight: 'bold',
            unicodeBidi: 'isolate',
            backgroundColor: 'transparent',
            borderLeft: '#d1f0a0'
        }
    )
    if (type === 'header' || type === 'subheader' || type === 'miniheader') {
        const style = headingStyle; // 見出しレベルを仮に '*' に固定
        return (
            <th style={{...commonsStyle, ...style}}>{children}</th>
        );
    }

    return (
        <td className={`sel-content ${type ? `sel-${type}` : ''}`} style={commonsStyle}>
            {children}
        </td>
    );
}
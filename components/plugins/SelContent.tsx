import React from 'react';
import { useDesignColor } from '@/utils/parsePlugins';
import { NextRouter, useRouter } from 'next/router'
import type { designColor } from '@/utils/wiki_settings';

interface SelContentProps {
    type: string;
    children: React.ReactNode;
};

export default function SelContent({ type, children }: SelContentProps) {
    const router:NextRouter = useRouter()
    const { wikiSlug } = router.query;
    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const designColor:designColor | null = useDesignColor(wikiSlugStr);
    const commonsStyle: React.CSSProperties = {
        border: '1px solid #a9a9a9',
        color: 'inherit',
        margin: '1px',
        padding: '3px',
        wordWrap: 'normal',
        fontSize: '1em',
        boxSizing: 'border-box',
        lineHeight: '1.6em',
        display: 'table-cell',
        verticalAlign: 'inherit',
        fontWeight: 'bold',
        unicodeBidi: 'isolate'
    }
    const headingStyle: React.CSSProperties = type === 'header'
    ? (
        designColor === 'pink' ? {
            backgroundColor: '#fad6e7',
        } : designColor === 'blue' ? {
            backgroundColor: '#cce3f8'
        } : designColor === 'yellow' ? {
            backgroundColor: '#feeaa4'
        } : {
            backgroundColor: '#d1f0a0'
        }
    )
    : type === 'subheader' ?
        (
            designColor === 'pink'
            ? {
                backgroundColor: 'transparent',
                borderColor: '#fad6e7'
            } : designColor === 'blue' ? {
                backgroundColor: 'transparent',
                borderColor: '#cce3f8'
            } : designColor === 'yellow' ? {
                backgroundColor: 'transparent',
                borderColor: '#feeaa4'
            } : {
                backgroundColor: 'transparent',
                borderColor: '#d1f0a0'
            }
        )
    : (
        designColor === 'pink' ?
        {
            backgroundColor: 'transparent',
            borderLeft: '#fad6e7'
        } : designColor === 'blue' ? {
            backgroundColor: 'transparent',
            borderLeft: '#cce3f8'
        } : designColor === 'yellow' ? {
            backgroundColor: 'transparent',
            borderLeft: '#feeaa4'
        } : {
            backgroundColor: 'transparent',
            borderLeft: '#d1f0a0'
        }
    )
    if (type === 'header' || type === 'subheader' || type === 'miniheader') {
        const style:React.CSSProperties = headingStyle; // 見出しレベルを仮に '*' に固定
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
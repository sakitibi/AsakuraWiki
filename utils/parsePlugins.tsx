import React, { useState, useEffect } from 'react';
import Accordion, { extractAccordions } from '@/components/Accordion';
import Fold, { extractFolds } from '@/components/Fold';
import SelContainer from '@/components/SelContainer';
import SelRow from '@/components/SelRow';
import SelContent from '@/components/SelContent';
import { supabase } from 'lib/supabaseClient';
import parseInline from '@/components/ParseInline';

export interface Context {
    wikiSlug: string;
    pageSlug: string;
    letContext?: Record<string, string>;
}

export interface AccordionBlock {
    prefix?: string;
    title?: string;
    level?: '*' | '**' | '***';
    isOpen?: boolean;
    body?: string;
    bodyNode?: React.ReactNode[];
    start?: number;
    end?: number;
    children?: AccordionBlock[]; // 子ブロックのためのプロパティ
}

interface BlockItem {
    type: 'accordion' | 'fold' | 'sel' | 'inline';
    start: number;
    end: number;
    node: React.ReactNode;
};

export interface FoldBlock {
    prefix: string;
    title?: React.ReactNode;
    body?: string;
    isOpen?: boolean;
    start?: number;
    end?: number;
    children?: FoldBlock[];
}

export function useDesignColor(slug: string) {
    const [color, setColor] = useState<'pink' | 'blue' | 'yellow' | 'default' | null>(null);
    useEffect(() => {
        async function fetchColor() {
            const { data, error } = await supabase
                .from('wikis')
                .select('design_color')
                .eq('slug', slug)
                .single();

            if (error || !data) {
                setColor('default');
                return;
            }

            setColor(data.design_color);
        }

        fetchColor();
    }, [slug]);

    return color;
}

export function isValidLineRange(range: string): boolean {
    const trimmed = range.trim()
    // 対応: "1", "1-", "-5", "3-8"
    return /^(\d+)?-(\d+)?$/.test(trimmed) || /^\d+$/.test(trimmed)
}

export function extractBracedBlock(
    source: string,
    startIdx: number,
    braceCount: number
): {
    body: string;
    end: number;
    success: boolean;
    unmatchedDepth?: number;
} {
    let depth = braceCount;
    let i = startIdx + braceCount;

    while (i < source.length) {
        const char = source[i];
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                const body = source.slice(startIdx + braceCount, i);
                return { body, end: i + 1, success: true };
            }
        }
        i++;
    }

    return {
        body: source.slice(startIdx + braceCount),
        end: source.length,
        success: false,
        unmatchedDepth: depth
    };
}

function extractSelContainersSafe(content: string, excludeRanges: { start: number; end: number }[], offset = 0): { body: string; start: number; end: number }[] {
    const raw = extractSelContainers(content);
    return raw
        .map(sel => ({
            ...sel,
            start: offset + sel.start,
            end: offset + sel.end,
        }))
        .filter(sel =>
            !excludeRanges.some(range =>
                sel.start >= range.start && sel.end <= range.end
            )
        );
}

function generateBlockItems(content: string, context: Context, offset = 0): BlockItem[] {
    const accordionBlocks = extractAccordions(content, offset, context);
    const foldBlocks = extractFolds(content, context);
    const accordionRanges = accordionBlocks.map(b => ({
        start: b.start!,
        end: b.end!
    }));
    const selContainers = extractSelContainersSafe(content, accordionRanges, offset);
    const items: BlockItem[] = [];

    accordionBlocks.forEach((blk, idx) => {
        if (blk.prefix) {
            items.push({
                type: 'inline',
                start: blk.start! - blk.prefix.length,
                end: blk.start!,
                node: <React.Fragment key={`acc-prefix-${idx}`}>
                        {parseInline(blk.prefix, context)}
                    </React.Fragment>,
            });
        }
        const children = generateBlockItems(blk.body!, context, blk.start!); // 再帰で描画生成
        items.push({
            type: 'accordion',
            start: blk.start!,
            end: blk.end!,
            node: (
                <Accordion
                key={`acc-${idx}`}
                title={blk.title!}
                level={blk.level!}
                initiallyOpen={blk.isOpen!}
                >
                    <>
                        {children.map((childItem, cidx) => (
                        <React.Fragment key={`acc-child-${idx}-${cidx}`}>
                            {childItem.node}
                        </React.Fragment>
                        ))}
                    </>
                </Accordion>
            ),
        });
    });

    console.log('🔍 foldBlocks数:', foldBlocks.length);
    foldBlocks.forEach((blk, idx) => {
        if (blk.start == null || blk.end == null) return;
        // prefix インライン
        items.push({
            type: 'inline',
            start: blk.start - blk.prefix.length,
            end: blk.start,
            node: (
            <React.Fragment key={`fold-prefix-${idx}`}>
                {parseInline(blk.prefix, context)}
            </React.Fragment>
            ),
        });

        // 折りたたみ中身も必ず再帰
        const children = generateBlockItems(blk.body!, context, blk.start);

        items.push({
            type: 'fold',
            start: blk.start,
            end: blk.end,
            node: (
                <Fold key={`fold-${idx}`} title={blk.title} initiallyOpen={blk.isOpen ?? false}>
                    {children.map((child, cidx) => (
                    <React.Fragment key={`fold-child-${idx}-${cidx}`}>
                        {child.node}
                    </React.Fragment>
                    ))}
                </Fold>
            ),
        });
    });

    selContainers.forEach((sel, idx) => {
        const fullText = content.slice(sel.start - offset, sel.end - offset);
        const containerNodes = parseWikiContentFragment(fullText);
        items.push({
            type: 'sel',
            start: sel.start,
            end: sel.end,
            node: (
                <React.Fragment key={`sel-${idx}`}>
                    {containerNodes}
                </React.Fragment>
            ),
        });
    });

    return items;
}

export function parseWikiContent(
    content: string,
    context: Context,
    offset = 0
): React.ReactNode[] {
    // ─── Debug: parseWikiContent に渡される原文の先頭スニペットを出力 ───
    console.log(
        `▶ parseWikiContent called (offset=${offset}). snippet:`,
        JSON.stringify(content.slice(0, 100).replace(/\n/g, '⏎'))
    );

    // ─── Debug: generateBlockItems の実行直前 ───
    console.log('▶ calling generateBlockItems...');
    const blockItems = generateBlockItems(content, context, offset);
    console.log(
        `▶ generateBlockItems returned ${blockItems.length} items:`,
        blockItems.map((b) => ({ type: b.type, start: b.start, end: b.end }))
    );

    const nodes: React.ReactNode[] = [];

    if (blockItems.length === 0) {
        console.warn(
        "🚫 No blockItems generated. fold構文が崩れている可能性"
        );
        const fallbackInline = parseInline(content.trim(), context);
        return [<React.Fragment key="inline-empty">{fallbackInline}</React.Fragment>];
    }

    // ─── Debug: ソート後のアイテム順序を確認 ───
    const sortedItems = [...blockItems].sort((a, b) => a.start - b.start);
    console.log(
        '▶ sortedItems:',
        sortedItems.map((b) => `${b.type}@${b.start}-${b.end}`)
    );

    let lastPos = offset;

    sortedItems.forEach((item, idx) => {
        console.log(`▶ item[${idx}]:`, item);

        const relativeStart = item.start - offset;

        // テキストを inline として挿入すべき範囲を検出
        if (item.start > lastPos) {
            const inlineText = content.slice(lastPos - offset, relativeStart);
            if (inlineText.trim()) {
                const inlineNodes = parseInline(inlineText, context);
                nodes.push(
                <React.Fragment key={`inline-${idx}`}>
                    {inlineNodes}
                </React.Fragment>
                );
            }
        }

        // ブロックノードを追加
        nodes.push(item.node);
        lastPos = item.end;
    });

    // 残余テキストの inline 処理
    const finalRelative = lastPos - offset;
    if (finalRelative < content.length) {
        const trailingText = content.slice(finalRelative);
        const cleaned = cleanupTrailingBraces(trailingText);
        if (cleaned) {
            const inlineNodes = parseInline(cleaned, context);
            nodes.push(
                <React.Fragment key="inline-final">
                {inlineNodes}
                </React.Fragment>
            );
        }
    }

    console.log(`▶ parseWikiContent returning ${nodes.length} React nodes\n`);
    return nodes;
}

function cleanupTrailingBraces(text: string): string {
    return text.replace(/};+$/, '').replace(/}$/, '').trim();
}

function extractSelContainers(content: string): { body: string; start: number; end: number }[] {
    const results: { body: string; start: number; end: number }[] = [];
    const re = /#sel_container(\{+)/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(content))) {
        const braceCount = match[1].length;
        const startIdx = match.index;
        const braceStart = startIdx + match[0].length - braceCount;

        const { body, end } = extractBracedBlock(content, braceStart, braceCount);
        results.push({ body, start: startIdx, end });

        re.lastIndex = end;
    }

    return results;
}

function parseWikiContentFragment(containerBlock: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const rowItems: React.ReactNode[] = [];
    const rowRe = /#sel_row\s*(\{+)/g;
    let match: RegExpExecArray | null;

    while ((match = rowRe.exec(containerBlock))) {
        const braceCount = match[1].length;
        const startIdx = match.index;
        const braceStart = startIdx + match[0].length - braceCount;
        const { body } = extractBracedBlock(containerBlock, braceStart, braceCount);

        const selContents: React.ReactNode[] = [];
        const contentRe = /&sel_content(?:\(([^)]*)\))?\{([\s\S]*?)\};?/g;
        let contentMatch: RegExpExecArray | null;

        while ((contentMatch = contentRe.exec(body))) {
            const [, type, inner] = contentMatch;
            if (inner?.trim()) {
                selContents.push(
                    <SelContent key={`sel-${match.index}-${contentMatch.index}`} type={type?.trim() || ''}>
                        {inner.trim()}
                    </SelContent>
                );
            }
        }

        rowItems.push(
            <SelRow
                key={`sel-row-${match.index}`}
            >
                {selContents}
            </SelRow>
        );
        rowRe.lastIndex = braceStart + body.length + braceCount;
    }

    if (rowItems.length > 0) {
        nodes.push(
            <SelContainer
                key="sel-container"
            >
                {rowItems}
            </SelContainer>
        );
    }
    return nodes;
}
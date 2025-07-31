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

export function extractBracedBlock(source: string, startIdx: number, braceCount: number): { body: string, end: number } {
    let depth = 0;
    let i = startIdx;
    const open = '{'.repeat(braceCount);
    const close = '}'.repeat(braceCount);

    while (i <= source.length - braceCount) {
        const slice = source.slice(i, i + braceCount);
        if (slice === open) {
            depth++;
            i += braceCount;
        } else if (slice === close) {
            depth--;
            i += braceCount;
            if (depth === 0) break;
        } else {
            i++;
        }
    }

    return {
        body: source.slice(startIdx + braceCount, i),
        end: i + braceCount,
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
        const children = generateBlockItems(blk.body!, context, blk.start!);
        // 💡 Accordion 描画時に blk.bodyNode を使わず parseWikiContent を使う
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
                    {children.length > 0
                        ? children.map((child, cidx) => (
                            <React.Fragment key={`acc-child-${idx}-${cidx}`}>
                                {child.node}
                            </React.Fragment>
                        ))
                        : blk.body
                        ? parseWikiContent(blk.body, context, blk.start!)
                        : null}
                </Accordion>
            ),
        });
    });

    console.log('🔍 foldBlocks数:', foldBlocks.length);
    foldBlocks.forEach((blk, idx) => {
        console.log(` ↪ fold[${idx}]:`, {
            start: blk.start,
            end: blk.end,
            prefix: blk.prefix,
            body: blk.body,
        });

        if (!blk.start || !blk.end) return;

        items.push({
            type: 'inline',
            start: blk.start - blk.prefix.length,
            end: blk.start,
            node: <React.Fragment key={`fold-prefix-${idx}`}>
                    {parseInline(blk.prefix, context)}
                </React.Fragment>,
        });

        const children = generateBlockItems(blk.body!, context, 0);
        items.push({
            type: 'fold',
            start: blk.start,
            end: blk.end,
            node: (
                <Fold
                    key={`fold-${idx}`}
                    title={blk.title}
                    initiallyOpen={blk.isOpen ?? false}
                >
                    {children.length > 0
                        ? children.map((child, cidx) => (
                            <React.Fragment key={`fold-child-${idx}-${cidx}`}>
                                {child.node}
                            </React.Fragment>
                        ))
                        : blk.body
                        ? parseWikiContent(blk.body, context, blk.start)
                        : null}
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

export function parseWikiContent(content: string, context: Context, offset = 0): React.ReactNode[] {
    const blockItems = generateBlockItems(content, context, offset);
    const nodes: React.ReactNode[] = [];

    // ✅ 挿入順にソートして描画
    blockItems.sort((a, b) => a.start - b.start);
    let lastPos = offset;

    if (blockItems.length === 0) {
        console.warn("🚫 No blockItems generated. fold構文が崩れている可能性");
    }

    blockItems.forEach((item, idx) => {
        console.log('📦 blockItems:', blockItems);
        const relativeStart = item.start - offset;
        const relativeEnd = item.end - offset;

        if (item.start > lastPos) {
            const inlineText = content.slice(lastPos - offset, relativeStart);
            const inlineNodes = parseInline(inlineText, context);
            nodes.push(
                <React.Fragment key={`inline-${idx}`}>
                    {inlineNodes}
                </React.Fragment>
            );
        }

        nodes.push(item.node);
        lastPos = item.end;

        console.log('lastPos → item.start:', lastPos, item.start);
        console.log(`📦 blockItems[${idx}]:`, {
            type: item.type,
            start: item.start,
            end: item.end,
            slice: content.slice(relativeStart, relativeEnd),
        });
    });

    if (lastPos - offset < content.length) {
        const inlineText = content.slice(lastPos - offset);
        const inlineNodes = parseInline(inlineText, context);
        nodes.push(
            <React.Fragment key="inline-final">
                {inlineNodes}
            </React.Fragment>
        );
    }

    return nodes;
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
        results.push({ body: body.trim(), start: startIdx, end });

        re.lastIndex = end;
        console.log(`🧩 sel_container[${results.length - 1}]:`, {
            start: startIdx,
            end,
            body,
        });
    }

    return results;
}

function parseWikiContentFragment(containerBlock: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];

    const rowRe = /#sel_row\s*(\{+)/g;
    const rowItems: React.ReactNode[] = [];
    let match: RegExpExecArray | null;

    while ((match = rowRe.exec(containerBlock))) {
        const braceCount = match[1].length;
        const startIdx = match.index;
        const braceStart = startIdx + match[0].length - braceCount;

        const { body } = extractBracedBlock(containerBlock, braceStart, braceCount);
        const rowBody = body;

        const contentRe = /&sel_content(?:\(([^)]*)\))?\{([\s\S]*?)\};?/g;
        const selContents: React.ReactNode[] = [];
        let contentMatch: RegExpExecArray | null;

        while ((contentMatch = contentRe.exec(rowBody))) {
            const [, type, inner] = contentMatch;
            selContents.push(
                <SelContent key={`sel-${match.index}-${contentMatch.index}`} type={type?.trim() || ''}>
                    {inner.trim()}
                </SelContent>
            );
            console.log(`📋 sel_row[${match.index}]:`, { raw: rowBody });
            console.log(`  ↪ sel_content:`, { type, inner });
        }

        rowItems.push(<SelRow key={`sel-row-${match.index}`}>{selContents}</SelRow>);
        rowRe.lastIndex = braceStart + body.length + braceCount;
    }

    nodes.push(<SelContainer key="sel-container">{rowItems}</SelContainer>);
    return nodes;
}
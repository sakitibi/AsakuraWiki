import React, { useState, useEffect } from 'react';
import Accordion from '@/components/Accordion';
import SelContainer from '@/components/SelContainer';
import SelRow from '@/components/SelRow';
import SelContent from '@/components/SelContent';
import { supabaseServer } from 'lib/supabaseClientServer';
import parseInline from '@/components/ParseInline';
import { Context, Token, ASTNode } from '@/components/parsePluginTypes';
import ExportBlock from '@/components/ExportBlock';
import ImportBlock from '@/components/ImportBlock';


export function useDesignColor(slug: string) {
    const [color, setColor] = useState<'pink' | 'blue' | 'yellow' | 'default' | null>(null);
    useEffect(() => {
        async function fetchColor() {
            const { data, error } = await supabaseServer
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

function tokenize(src: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < src.length) {
        // #accordion（開き）
        const openRe = /^#accordion\s*(?:\(\s*([^)]+)\)|\s+([^{]+))\s*\{{2,}/;
        const openM = src.slice(i).match(openRe);
        if (openM) {
            const argsRaw = (openM[1] || openM[2] || '').trim().split(',').map(s => s.trim());
            tokens.push({
                type: 'open',
                title: argsRaw[0] || '',
                level: (argsRaw.find(a => /^\*{1,3}$/.test(a)) as '*'|'**'|'***') ?? '*',
                isOpen: argsRaw.includes('open'),
            });
            i += openM[0].length;
            continue;
        }

        // 閉じ braces
        const closeM = src.slice(i).match(/^\}{2,}/);
        if (closeM) {
            tokens.push({ type: 'close' });
            i += closeM[0].length;
            continue;
        }
        const exportMatch = src.match(/^#export\((global|local)\)\{(.+?)\};$/);
        if (exportMatch) {
            const scope = exportMatch[1] as 'global' | 'local';
            const variables = exportMatch[2].split(',').map(v => v.trim());
            return [{ type: 'export', scope, variables }];
        }

        const importMatch = src.match(/^#import\(([^:]+):([^)]+)\)\{(.+?)\};$/);
        if (importMatch) {
            const slug = importMatch[1];
            const page = importMatch[2];
            const variables = importMatch[3].split(',').map(v => v.trim());
            return [{ type: 'import', slug, page, variables }];
        }

        // それ以外はテキスト１文字ずつ
        tokens.push({ type: 'text', content: src[i++] });
    }

    return tokens;
}

function buildAST(src: string): ASTNode[] {
    const tokens = tokenize(src);
    const root: ASTNode[] = [];
    const stack: ASTNode[][] = [root];

    for (const tk of tokens) {
        const curr = stack[stack.length - 1];
        if (tk.type === 'text') {
            const last = curr[curr.length - 1];
            if (last?.type === 'text') {
                last.content += tk.content;
            } else {
                curr.push({ type: 'text', content: tk.content });
            }
        }
        else if (tk.type === 'open') {
            const node: ASTNode = {
                type: 'accordion',
                title: tk.title,
                level: tk.level,
                isOpen: tk.isOpen,
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'close') {
            if (stack.length > 1) stack.pop();
        }
        else if (tk.type === 'export') {
            const node: ASTNode = {
                type: 'export',
                scope: tk.scope,
                variables: [],
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'import') {
            const node: ASTNode = {
                type: 'import',
                slug: tk.slug,
                page: tk.page,
                variables: [],
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
    }

    return root;
}

function renderAST(
    nodes: ASTNode[],
    context: Context
): React.ReactNode[] {
    return nodes.map((node, idx) => {
        if (node.type === 'text') {
            return (
                <React.Fragment key={`t${idx}`}>
                    {parseInline(node.content, context)}
                </React.Fragment>
            );
        }

        if (node.type === 'accordion') {
            return (
                <Accordion
                    key={`a${idx}`}
                    title={node.title}
                    level={node.level}
                    initiallyOpen={node.isOpen}
                >
                    {renderAST(node.children, context)}
                </Accordion>
            );
        }
        else if (node.type === 'export') {
            return (
                <ExportBlock
                    key={`e${idx}`}
                    scope={node.scope}
                    variables={node.variables}
                >
                {renderAST(node.children, context)}
                </ExportBlock>
            );
        }

        else if (node.type === 'import') {
            return (
                <ImportBlock
                    key={`i${idx}`}
                    slug={node.slug}
                    page={node.page}
                    variables={node.variables}
                >
                {renderAST(node.children, context)}
                </ImportBlock>
            );
        }

        // 他のノード型は無視するか、別途処理
        return null;
    });
}

export function parseWikiContent(
    content: string,
    context: Context
): React.ReactNode[] {
    // トークン→AST化
    const ast = buildAST(content);

    // AST→React ノード
    return renderAST(ast, context);
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
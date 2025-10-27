import React, { useState, useEffect } from 'react';
import Accordion from '@/components/Accordion';
import { supabaseServer } from 'lib/supabaseClientServer';
import parseInline from '@/components/ParseInline';
import { Context, Token, ASTNode } from '@/components/parsePluginTypes';
import ExportBlock from '@/components/ExportBlock';
import ImportBlock, { resolveImports } from '@/components/ImportBlock';
import type { designColor } from '@/utils/wiki_settings';
import Fold from '@/components/Fold';
import styles from '@/css/wikis.min.module.css';
import FunctionCallRenderer from '@/components/functionCall';

export function useDesignColor(slug: string) {
    const [color, setColor] = useState<designColor | null>(null);
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
    const trimmed:string = range.trim()
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
    let depth:number = braceCount;
    let i:number = startIdx + braceCount;

    while (i < source.length) {
        const char = source[i];
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                const body:string = source.slice(startIdx + braceCount, i);
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

function tokenize(src: string): Token[] {
    const tokens: Token[] = [];
    let i:number = 0;

    while (i < src.length) {
        // #accordion（開き）
        const openRe:RegExp = /^#accordion\s*(?:\(\s*([^)]+)\)|\s+([^{]+))\s*\{{2,}/;
        const openM:RegExpMatchArray | null = src.slice(i).match(openRe);
        if (openM) {
            const argsRaw:string[] = (openM[1] || openM[2] || '').trim().split(',').map(s => s.trim());
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
        const closeM:RegExpMatchArray | null = src.slice(i).match(/^\}{2,}/);
        if (closeM) {
            tokens.push({ type: 'close' });
            i += closeM[0].length;
            continue;
        }
        const openReFold:RegExp = /^#fold\s*(?:\(\s*([^)]+)\)|\s+([^{]+))\s*\{{2,}/;
        const openMFold:RegExpMatchArray | null = src.slice(i).match(openReFold);
        if (openMFold) {
            const argsRaw = (openMFold![1] || openMFold![2] || '').trim().split(',').map(s => s.trim());
            tokens.push({
                type: 'openFolds',
                title: argsRaw[0] || '',
                isOpen: argsRaw.includes('openFolds'),
            });
            i += openMFold[0].length;
            continue;
        }

        // 閉じ braces
        const closeMFold:RegExpMatchArray | null = src.slice(i).match(/^\}{2,}/);
        if (closeMFold) {
            tokens.push({ type: 'closeFolds' });
            i += closeMFold[0].length;
            continue;
        }
        const exportMatch = src.slice(i).match(/^#export\((global|local)\)\{(.+?)\};/);
        if (exportMatch) {
            const scope = exportMatch[1] as 'global' | 'local';
            const variables = exportMatch[2].split(',').map(v => v.trim());
            tokens.push({ type: 'export', scope, variables });
            i += exportMatch[0].length;
            continue;
        }

        const importMatch = src.slice(i).match(/^#import\(([^:]+):([^)]+)\)\{(.+?)\};/);
        if (importMatch) {
            const slug = importMatch[1];
            const page = importMatch[2];
            const variables = importMatch[3].split(',').map(v => v.trim());
            tokens.push({ type: 'import', slug, page, variables });
            i += importMatch[0].length;
            continue;
        }
        // #function(name,arg1,arg2){{ #return value }}
        // #function(name,arg1,arg2){{{ ... #return value }}}
        const functionMatch = src.slice(i).match(/^#function\(\s*([a-zA-Z0-9_]+)?(?:\s*,\s*([^)]+))?\)\s*(\{+)/);
        if (functionMatch) {
            const name = functionMatch[1]?.trim() ?? '';
            const argsRaw = functionMatch[2];
            const args = argsRaw ? argsRaw.split(',').map(s => s.trim()) : [];
            const braceCount = functionMatch[3].length;
            const braceStart = i + src.slice(i).indexOf(functionMatch[3]);
            const block = extractBracedBlock(src, braceStart, braceCount);
            if (block.success) {
                const returnMatch = block.body.match(/#return\s*(.*)/);
                const returnValue = returnMatch ? returnMatch[1].trim() : null;
                const body = returnMatch ? block.body.slice(0, returnMatch.index).trim() : block.body.trim();
                tokens.push({
                    type: 'function',
                    name,
                    args,
                    body,
                    returnValue
                });

                i = braceStart + block.end;
                continue;
            }
        }
        // &function-call(name,arg1,arg2);
        const functionCallMatch = src.slice(i).match(/^&function-call\(\s*([a-zA-Z0-9_]+)\s*(?:,\s*([^)]+))?\s*\);/);
        if (functionCallMatch) {
            const name = functionCallMatch[1].trim();
            const argsRaw = functionCallMatch[2];
            const args = argsRaw ? argsRaw.split(',').map(s => s.trim()) : [];
            tokens.push({
                type: 'functionCall',
                name,
                args,
            });

            i += functionCallMatch[0].length;
            continue;
        }
        // それ以外はテキスト１文字ずつ
        tokens.push({ type: 'text', content: src[i++] });
    }

    return tokens;
}

function buildAST(src: string, context: Context): ASTNode[] {
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
                level: tk.level ?? "*",
                isOpen: tk.isOpen,
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'close') {
            if (stack.length > 1) stack.pop();
        }
        else if (tk.type === 'openFolds') {
            const node: ASTNode = {
                type: 'fold',
                title: tk.title,
                isOpen: tk.isOpen,
                children: [],
            };
            curr.push(node);
            stack.push((node as any).children);
        }
        else if (tk.type === 'closeFolds') {
            if (stack.length > 1) stack.pop();
        }
        else if (tk.type === 'export') {
            const node: ASTNode = {
                type: 'export',
                scope: tk.scope,
                variables: tk.variables,
            };
            curr.push(node);
        }
        else if (tk.type === 'import') {
            const node: ASTNode = {
                type: 'import',
                slug: tk.slug,
                page: tk.page,
                variables: tk.variables,
            };
            curr.push(node);
        }
        else if (tk.type === 'function') {
            const node: ASTNode = {
                type: 'function',
                name: tk.name,
                args: tk.args,
                body: tk.body,
                returnValue: tk.returnValue
            };
            curr.push(node);

            // 関数定義を context に保存
            if (!context.functions) context.functions = {};
            context.functions[tk.name] = {
                args: tk.args,
                returnValue: tk.returnValue,
                body: tk.body
            };
        }
        else if (tk.type === 'functionCall') {
            const node: ASTNode = {
                type: 'functionCall',
                name: tk.name,
                args: tk.args,
            };
            curr.push(node);
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
                    {parseInline({text: node.content, context})}
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
        else if (node.type === 'fold') {
            return (
                <Fold
                    key={`f${idx}`}
                    title={node.title}
                    initiallyOpen={node.isOpen}
                >
                    {renderAST(node.children, context)}
                </Fold>
            );
        }
        else if (node.type === 'export') {
            return (
                <ExportBlock
                    key={`e${idx}`}
                    scope={node.scope}
                    variables={node.variables}
                >
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
                </ImportBlock>
            );
        }
        else if (node.type === 'function') {
            return (
                <div key={`fd${idx}`} className={styles.functionBlock}>
                    <strong>Function: {node.name}</strong>
                    <div>Args: {node.args.join(', ')}</div>
                    <pre>{node.body}</pre>
                    <div>Return: {node.returnValue}</div>
                </div>
            );
        }
        else if (node.type === 'functionCall') {
            return (
                <FunctionCallRenderer
                    name={node.name}
                    args={node.args}
                    context={context}
                />
            );
        }
        // 他のノード型は無視するか、別途処理
        return null;
    });
}

export async function parseWikiContent(
    content: string,
    context: Context
): Promise<React.ReactNode[]> {
    await resolveImports(content, context); // ← import変数を注入
    // トークン→AST化
    const ast = buildAST(content, context);
    // AST→React ノード
    return renderAST(ast, context);
}
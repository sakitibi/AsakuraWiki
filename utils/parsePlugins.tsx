import React, { useState, useEffect } from 'react';
import { Context, Token, extractBracedBlockProps } from '@/components/plugins/parsePluginTypes';
import { resolveImports } from '@/components/plugins/ImportBlock';
import type { designColor } from '@/utils/wiki_settings';
import { buildAST, renderAST } from '@/utils/AST';
import { fetchColorParsePlugin } from '@/utils/fetchColor';

export function useDesignColor(slug: string) {
    const [color, setColor] = useState<designColor | null>(null);
    useEffect(() => {
        fetchColorParsePlugin(
            slug,
            setColor
        );
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
): extractBracedBlockProps {
    let depth = 1;
    let i = startIdx + braceCount;
    const openBrace = '{'.repeat(braceCount);
    const closeBrace = '}'.repeat(braceCount);

    while (i < source.length) {
        if (source.slice(i).startsWith(openBrace)) {
            depth++;
            i += braceCount;
            continue;
        }
        if (source.slice(i).startsWith(closeBrace)) {
            depth--;
            i += braceCount;
            if (depth === 0) {
                const body = source.slice(startIdx + braceCount, i - braceCount);
                return { body, end: i, success: true };
            }
            continue;
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

export function tokenize(src: string): Token[] {
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
                const body = block.body.trim(); // ← #return含めて保持

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
        // それ以外はテキスト１文字ずつ
        tokens.push({ type: 'text', content: src[i++] });
    }

    return tokens;
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
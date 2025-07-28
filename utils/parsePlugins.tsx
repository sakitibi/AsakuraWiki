import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Calendar2 from '@/components/Calendar2';
import CommentForm from '@/components/CommentForm';
import RealTimeComments from '@/components/RealTimeComments';
import PageList from '@/components/PageList';
import PageList2 from '@/components/PageList2';
import IncludePage from '@/components/IncludePage';
import TableOfContents from '@/components/TableOfContents';
import SelContainer from '@/components/SelContainer';
import SelRow from '@/components/SelRow';
import SelContent from '@/components/SelContent';
import calcPlugin from '@/components/calcPlugin';
import { DATEDIF, DATEVALUE } from './dateFunctions';
import { supabase } from 'lib/supabaseClient';
import Accordion, { extractAccordions } from '@/components/Accordion';

type Context = {
    wikiSlug: string;
    pageSlug: string;
    letContext?: Record<string, string>;
}

export type AccordionBlock = {
    prefix?: string;
    title?: string;
    level?: '*' | '**' | '***';
    isOpen?: boolean;
    body?: string;
    start?: number;
    end?: number;
    children?: AccordionBlock[]; // 子ブロックのためのプロパティ
}

type BlockItem = {
    type: 'accordion' | 'fold' | 'sel' | 'inline';
    start: number;
    end: number;
    node: React.ReactNode;
};

type FoldBlock = {
    prefix?: string
    title?: React.ReactNode
    isOpen?: boolean
    body?: string
    start?: number;
    end?: number;
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

/** インラインプラグインを処理します */
export function parseInline(text: string, context: Context): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let nodeKey = 0;
    text.split(/\r?\n/).forEach((line) => {
        // 1) 見出しか?（*テキスト [anchor] に対応）
        const headingMatch = line.match(/^(\*{1,3})\s*(.+?)(?:\s*\[(.+?)\])?$/);
        if (headingMatch) {
            const stars = headingMatch[1] as "*" | "**" | "***";
            const title = headingMatch[2].trim();
            const anchor = headingMatch[3]?.trim() ?? "";

            nodes.push(
                <Header
                    key={`hdr-${nodeKey++}`}
                    level={stars}
                    title={title}
                    anchor={anchor}
                />
            );
            return;
        }

        // 2) その他の行のインライン解析
        const parsedLine = parseOtherInline(line, wikiSlug, pageSlug, context, nodeKey);
        nodes.push(...parsedLine);
        nodeKey += parsedLine.length || 1;
    });

    return nodes;
}

function isValidLineRange(range: string): boolean {
    const trimmed = range.trim()
    // 対応: "1", "1-", "-5", "3-8"
    return /^(\d+)?-(\d+)?$/.test(trimmed) || /^\d+$/.test(trimmed)
}

function extractBracedBlock(source: string, startIdx: number): { body: string, end: number } {
    let depth = 0
    let i = startIdx
    while (i < source.length) {
        if (source[i] === '{') depth++
        else if (source[i] === '}') {
            depth--
            if (depth === 0) break
        }
        i++
    }
    return {
        body: source.slice(startIdx + 1, i),
        end: i + 1,
    }
}

/** 既存の #calendar2 や #comment 系を処理するヘルパー */
export function parseOtherInline(
    line: string,
    wikiSlug: string,
    pageSlug: string,
    context: Context & {
        letContext?: Record<string, string>;
        constContext?: Record<string, string>;
    },
    baseKey: number,
): React.ReactNode[] {
    const nodes: React.ReactNode[] = []
    const safeTrim = (v: unknown) => typeof v === 'string' ? v.trim() : ''
    let last = 0
    let m: RegExpExecArray | null
    // 各プラグインを順次キャプチャする正規表現
    const re = /#calendar2\((\d{4})(\d{2})(?:,(off))?\)|#DATEDIF\(\s*([0-9-]+)\s*,\s*([0-9-]+)\s*,\s*([YMD])\s*\)|#DATEVALUE\(\s*([^)]+)\s*\)|#rtcomment(?:\(\))?|#comment|#hr|#br|&br;|#ls(?:\(([^)]+)\))?|#ls2\(\s*([^[\],]+)(?:\[\s*([^\]]+)\s*\])?(?:,\s*\{\s*([^}]+)\s*\})?(?:,\s*([^)]+))?\)|#include\(([^)]+)\)|#contents|^CENTER:\s*(.+)|^LEFT:\s*(.+)|^RIGHT:\s*(.+)|&size\((\d+)\)\{([^}]+)\};|\[\[([^\]>]+)>([^\]]+)\]\]|&color\(\s*([^)]+?)\s*(?:,\s*([^)]+?))?\)\{([\s\S]*?)\};|&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);|&escape\(\)\{([\s\S]*?)\}|#marquee\(([^,]*),([^,]*),([^,]*),([^,]*),([^,]*),([^,]*)(?:,([^)]*))?\)|#const\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|#let\(\s*([^:]+?)\s*:\s*([^)]+?)\s*\)\{([^\}]+?)\};|&const-use\(([^)]+?)\);|&let-use\(([^)]+?)\);|&relet\(([^)]+?)\);|&calc\(([^)]+?)\);/giu

    while ((m = re.exec(line))) {
        // トークンの手前テキストをそのまま文字ノードに
        if (m.index > last) {
            nodes.push(line.slice(last, m.index))
        }
        const token = m[0]
        const key = `inl-${baseKey}-${m.index}`
        //console.table(m);

        // --- plugin branches ---
        // #calendar2(Y,M,off?)
        if (token.startsWith('#marquee')) {
            const text = m[28];
            const loop = m[29];
            const slide = m[30];
            const bgColor = m[31];
            const color = m[32];
            const size = m[33];
            const fontSize = size ? `${size}px` : 'inherit';

            const iterationCount = loop && /^\d+$/.test(loop)
                ? Number(loop)
                : 'infinite';

            // 画面サイズから suffix を決定
            let sizeSuffix = 'xl';
            if (typeof window !== 'undefined') {
                const screenWidth = window.innerWidth;
                if (screenWidth < 700) {
                    sizeSuffix = 'sm';
                } else if (screenWidth < 1000) {
                    sizeSuffix = 'md';
                }
            }

            // animation名を単純な文字列として構築（CSS Modules不要！）
            const animationBase =
                slide === 'slide'
                ? 'scroll-slide-once'
                : slide === 'alternate'
                ? 'scroll-alternate'
                : 'scroll-default';
            const animationName = `${animationBase}-${sizeSuffix}`;

            const animationStyle = {
                animationName,
                animationDuration:
                    slide === 'slide' ? '5s'
                    : slide === 'alternate' ? '7s'
                    : '15s',
                animationTimingFunction:
                    slide === 'slide' || slide === 'alternate' ? 'ease-in-out' : 'linear',
                animationIterationCount: iterationCount,
                animationDirection: slide === 'alternate' ? 'alternate' : 'normal',
                animationFillMode: slide === 'slide' ? 'forwards' : 'none',
                display: 'inline-block',
            };

            nodes.push(
                <div
                    key={key}
                    style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        backgroundColor: bgColor ?? 'transparent',
                        color: color ?? 'inherit',
                        fontSize,
                    }}
                >
                    <div style={animationStyle}>{text}</div>
                </div>
            );

            last = m.index + token.length;
        }
        else if (token.startsWith('&escape(')) {
            const braceStart = token.indexOf('{')
            const braceBlock = extractBracedBlock(token, braceStart)
            nodes.push(
                <span key={key} dangerouslySetInnerHTML={{ __html: braceBlock.body }} />
            )

            last = m.index + token.length
            continue
        }
        else if (token.startsWith('#calendar2')) {
            const [, y, mo, off] = m
            nodes.push(
                <Calendar2
                    key={key}
                    year={+y}
                    month={+mo}
                    hideHolidays={off === 'off'}
                />
            )
            last = m.index + token.length
        }
        // #DATEDIF(d1,d2,unit)
        else if (token.startsWith('#DATEDIF')) {
            const val = DATEDIF(m[4], m[5], m[6] as any)
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #DATEVALUE(str)
        else if (token.startsWith('#DATEVALUE')) {
            const val = DATEVALUE(m[7])
            nodes.push(<span key={key}>{isNaN(val) ? 'ERR' : val}</span>)
            last = m.index + token.length
        }
        // #comment
        else if (token === '#comment') {
            nodes.push(<CommentForm key={key} />)
            last = m.index + token.length
        }
        // #rtcomment
        else if (token.startsWith('#rtcomment')) {
            nodes.push(
                <RealTimeComments
                    key={key}
                    wikiSlug={wikiSlug}
                    pageSlug={pageSlug}
                />
            )
            last = m.index + token.length
        }
        // #hr
        else if (token === '#hr') {
            nodes.push(<hr key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('#br')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        else if (token.startsWith('&br;')) {
            nodes.push(<br key={key} />)
            last = m.index + token.length
        }
        // #ls([title])
        else if (token.startsWith('#ls')) {
            const prefix = safeTrim(m[8]) || undefined
            nodes.push(<PageList key={key} prefix={prefix} />)
            last = m.index + token.length
        }
        // #ls2(pattern[,…][,…][,…])
        else if (token.startsWith('#ls2')) {
            // m[9] = パターン (例: 'Foo/')
            // m[10] = [オプションリスト]
            // m[11] = {include,...} ブロック型オプション
            // m[12] = 表示用ラベル
            const pattern = safeTrim(m[9])
            const opts = m[10]?.split(',').map(s => safeTrim(s)) ?? []
            const blockOpts = m[11]?.split(',').map(s => safeTrim(s)) ?? []
            const label = safeTrim(m[12])

            nodes.push(
                <PageList2
                    key={key}
                    wikiSlug={wikiSlug}
                    pattern={pattern}
                    options={[...opts, ...blockOpts]}
                    label={label}
                />
            )
            last = m.index + token.length
        }
        // #include(pageName|css,flag)
        else if (token.startsWith('#include')) {
            const arg = safeTrim(m[13]!)
            const parts = arg.split(',').map(s => safeTrim(s))
            const [first, lineRange, flag] = parts

            let showTitle: boolean | undefined
            if (flag === 'notitle') showTitle = false
            else if (flag === 'none') showTitle = false
            else if (flag === 'title') showTitle = true

            let pageName = first
            let stylesheetURL: string | undefined
            if (first.includes('|')) {
                const [name, css] = first.split('|', 2).map(s => safeTrim(s))
                pageName = name
                stylesheetURL = css
            }

            if (lineRange && !isValidLineRange(lineRange)) {
                nodes.push(
                    <div key={key} style={{ color: 'red' }}>
                    読み込み失敗: 無効な行範囲です（format: 1-5, 3-, -4 など）
                    </div>
                )
                continue
            }
            nodes.push(
                <IncludePage
                    key={key}
                    wikiSlug={wikiSlug}
                    page={pageName}
                    showTitle={showTitle}
                    stylesheetURL={stylesheetURL}
                    lineRange={lineRange}
                />
            )
            last = m.index + token.length
        }
        // #contents
        else if (token === '#contents') {
            nodes.push(<TableOfContents key={key} />)
            last = m.index + token.length
        }
        // CENTER:
        else if (m[14]) {
            const centered = safeTrim(m[14]);
            const inner = parseOtherInline(centered, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'center' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[15]) {
            const aligned = safeTrim(m[15]);
            const inner = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'left' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }

        else if (m[16]) {
            const aligned = safeTrim(m[16]);
            const inner = parseOtherInline(aligned, wikiSlug, pageSlug, context, baseKey + 1);
            nodes.push(
                <div key={key} style={{ textAlign: 'right' }}>
                    <>{Array.isArray(inner) ? inner : [inner]}</>
                </div>
            );
            last = m.index + token.length;
        }
        else if (token.startsWith('&size(')) {
            const sizeStart = token.indexOf('(')
            const braceStart = token.indexOf('{', sizeStart)
            const braceBlock = extractBracedBlock(token, braceStart)
            const fontSize = parseInt(token.slice(sizeStart + 1, braceStart - 1), 10)
            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1)
            nodes.push(
                <span key={key} style={{ fontSize: `${fontSize}px` }}>
                    {content}
                </span>
            )
            last = m.index + token.length // ✅これに変更！
        }
        else if (token.startsWith('&color(')) {
            const parenStart = token.indexOf('(')
            const parenEnd = token.indexOf(')', parenStart)
            const braceStart = token.indexOf('{', parenEnd)
            if (parenEnd === -1 || braceStart === -1) {
                nodes.push(<span key={key} style={{ color: 'red' }}>構文エラー: &color 構文不正</span>)
                continue
            }

            const braceBlock = extractBracedBlock(token, braceStart)

            const args = token.slice(parenStart + 1, parenEnd).split(',').map(s => safeTrim(s))
            const color = args[0]
            const background = args[1]

            const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1)

            nodes.push(
                <span
                key={key}
                style={{
                    ...(color ? { color } : {}),
                    ...(background ? { backgroundColor: background } : {}),
                }}
                >
                <>{Array.isArray(content) ? content : [content]}</>
                </span>
            )

            last = m.index + token.length
            continue
        }
        else if (token.startsWith('[[')) {
            const plainLink = token.match(/\[\[([^\]]+)\]\]/)
            const labeledLink = token.match(/\[\[([^\]>]+)>([^\]]+)\]\]/)
            if (labeledLink) {
                const label = labeledLink[1].trim()
                const url = labeledLink[2].trim()
                const inner = parseOtherInline(label, wikiSlug, pageSlug, context, baseKey + 1)
                nodes.push(<a key={key} href={url}>{inner}</a>)
                last = m.index + token.length // ✅ここを追加
                continue
            } else if (plainLink) {
                const url = plainLink[1].trim()
                nodes.push(
                    <a key={key} href={url}>
                        {url}
                    </a>
                )
            } else {
                nodes.push(token) // 解析できなかった場合はそのまま表示
            }
            last = m.index + token.length
        }
        else if (token.startsWith('&attachref(')) {
            const match = token.match(/&attachref\(\s*([^)]+?),\s*(\d+)x(\d+)\s*\);?/)
            if (match) {
                const url = match[1].trim()
                const width = parseInt(match[2], 10)
                const height = parseInt(match[3], 10)
                nodes.push(
                    <img key={key} src={url} width={width} height={height} alt={url} />
                )
            } else {
                nodes.push(token)
            }
            last = m.index + token.length
        }
        // 型付き #const(name:type){value};
        else if (m[35] && m[36] && m[37]) {
            const varName = m[35].trim();
            const varType = m[36].trim();
            const varValue = m[37].trim();
            context.constContext = context.constContext ?? {};

            if (varName in context.constContext) {
                nodes.push(<span key={key} style={{ color: 'red' }}>定数 {varName} は再定義不可！</span>);
            } else {
                context.constContext[varName] = varValue;
                nodes.push(
                <span key={key} style={{ display: 'none', fontWeight: 'bold' }}>
                    定数 {varName}（{varType}） = {varValue}
                </span>
                );
            }
            last = m.index + token.length;
        }

        // 型付き #let(name:type){value};
        else if (m[38] && m[39] && m[40]) {
            const varName = m[38].trim();
            const varType = m[39].trim();
            const varValue = m[40].trim();
            context.letContext = context.letContext ?? {};
            context.letContext[varName] = varValue;
            nodes.push(
                <span key={key} style={{ display: 'none', fontStyle: 'italic' }}>
                変数 {varName}（{varType}） ← {varValue}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[41]) {
            // &const-use(name);
            const varName = m[41].trim();
            const value = context.constContext?.[varName];
            nodes.push(
                <span key={key}>
                {value ?? `[定数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[42]) {
        // &let-use(name);
            const varName = m[42].trim();
            const value = context.letContext?.[varName];
            nodes.push(
                <span key={key}>
                {value ?? `[変数未定義:${varName}]`}
                </span>
            );
            last = m.index + token.length;
        }

        else if (m[43]) {
            // &relet(name);
            const varName = m[43].trim();
            if (context.letContext?.[varName]) {
                nodes.push(
                <span key={key} style={{ display: 'none' }}>
                    再代入OK: {varName}
                </span>
                );
            } else {
                nodes.push(
                <span key={key} style={{ color: 'red' }}>
                    再代入対象 `{varName}` が未定義です
                </span>
                );
            }
            last = m.index + token.length;
        }
        else if (m[44]) {
            const args = m[44].split(',').map(s => s.trim());
            const [expression, decStr, style, intStr] = args;
            const decimals = decStr !== undefined ? Number(decStr) : 0;
            const integers = intStr !== undefined ? Number(intStr) : undefined;
            const resolvedExpr = expression.replace(/\b[a-zA-Z_]\w*\b/g, varName => {
                return context.constContext?.[varName] ?? context.letContext?.[varName] ?? varName;
            });
            try {
                const result = calcPlugin(resolvedExpr, decimals, style, integers);
                nodes.push(<span key={key}>{result}</span>);
            } catch (e) {
                nodes.push(<span key={key} style={{ color: 'red' }}>計算失敗</span>);
            }

            last = m.index + token.length;
        }
    }
    // 最後に残ったテキスト
    if (last < line.length) {
        const rest = line.slice(last).trim()

        // 不要な }; が出るならここで除去
        const cleaned = rest.replace(/^};+$/, '')

        const splitByEscapedNewline = cleaned.split(/\\n/)
        for (let i = 0; i < splitByEscapedNewline.length; i++) {
            if (splitByEscapedNewline[i]) {
                nodes.push(splitByEscapedNewline[i])
            }
            if (i < splitByEscapedNewline.length - 1) {
                nodes.push(<br key={`${baseKey}-br-${last}-${i}`} />)
            }
        }
    }
    return nodes
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
    const accordionBlocks = extractAccordions(content, offset);
    const foldBlocks = extractFolds(content, context);
    const accordionRanges = accordionBlocks.map(b => ({ start: b.start!, end: b.end! }));
    const selContainers = extractSelContainersSafe(content, accordionRanges, offset);

    const items: BlockItem[] = [];

    accordionBlocks.forEach((blk, idx) => {
        if (blk.prefix) {
            items.push({
                type: 'inline',
                start: blk.start! - blk.prefix.length,
                end: blk.start!,
                node: <React.Fragment key={`acc-prefix-${idx}`}>{parseInline(blk.prefix, context)}</React.Fragment>,
            });
        }

        const children = generateBlockItems(blk.body!, context, blk.start!);

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
                    {children.map((child, cidx) => (
                        <React.Fragment key={`acc-child-${idx}-${cidx}`}>{child.node}</React.Fragment>
                    ))}
                </Accordion>
            ),
        });
    });

    foldBlocks.forEach((blk, idx) => {
        if (!blk.title || !blk.body) return;
        items.push({
            type: 'fold',
            start: blk.start!,
            end: blk.end!,
            node: (
                <Fold
                    key={`fold-${idx}`}
                    title={blk.title}
                    initiallyOpen={blk.isOpen ?? false}
                >
                    {parseWikiContentFragment(blk.body)}
                </Fold>
            ),
        });
    });

    selContainers.forEach((sel, idx) => {
        const fullText = content.slice(sel.start - offset, sel.end - offset); // content はローカルなブロック
        const containerNodes = parseWikiContentFragment(fullText);
        items.push({
            type: 'sel',
            start: sel.start,
            end: sel.end,
            node: <React.Fragment key={`sel-${idx}`}>{containerNodes}</React.Fragment>,
        });
    });

    return items;
}

export function parseWikiContent(content: string, context: Context): React.ReactNode[] {
    const blockItems = generateBlockItems(content, context);
    const nodes: React.ReactNode[] = [];

    // ✅ 挿入順にソートして描画
    blockItems.sort((a, b) => a.start - b.start);
    let lastPos = 0;
    blockItems.forEach((item, idx) => {
        if (item.start > lastPos) {
            const inlineText = content.slice(lastPos, item.start);
            const inlineNodes = parseInline(inlineText, context);
            nodes.push(<React.Fragment key={`inline-${idx}`}>{inlineNodes}</React.Fragment>);
        }

        nodes.push(item.node);
        lastPos = item.end;

        console.log('lastPos → item.start:', lastPos, item.start);
        console.log(`📦 blockItems[${idx}]:`, {
            type: item.type,
            start: item.start,
            end: item.end,
            slice: content.slice(item.start, item.end),
        });
    });

    if (lastPos < content.length) {
        const inlineText = content.slice(lastPos);
        const inlineNodes = parseInline(inlineText, context);
        nodes.push(<React.Fragment key="inline-final">{inlineNodes}</React.Fragment>);
    }

    return nodes;
}

    function extractFolds(content: string, context: Context): FoldBlock[] {
        const foldRe = /#fold\(([^)]*?)\)\s*\{\{([\s\S]*?)\}\}/g;
        const blocks: FoldBlock[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = foldRe.exec(content)) !== null) {
            const [full, rawArgs, body] = match;
            const args = rawArgs.split(',').map(s => s.trim());
            const titleRaw = args[0];
            const isOpen = args.includes('open');

            const parsedTitle = parseInline(titleRaw, context);
            const start = match.index;
            const end = start + full.length;

            blocks.push({
                prefix: content.slice(lastIndex, start),
                title: <>{parsedTitle}</>,
                body: body.trim(),
                isOpen,
                start,
                end,
            });

            console.log(`📁 fold[${blocks.length}]:`, {
                titleRaw, isOpen, start, end, body,
            });

            lastIndex = end;
        }

        blocks.push({ prefix: content.slice(lastIndex) });
        return blocks;
    }

function extractSelContainers(content: string): { body: string; start: number; end: number }[] {
    const results: { body: string; start: number; end: number }[] = [];
    const startTag = '#sel_container{{';
    let pos = 0;

    while (pos < content.length) {
        const startIdx = content.indexOf(startTag, pos);
        if (startIdx === -1) break;

        let braceLevel = 1; // ← ここが重要！
        let endIdx = -1;

        for (let i = startIdx + startTag.length; i < content.length; i++) {
            if (content.slice(i, i + 2) === '{{') {
                braceLevel++; i++;
            } else if (content.slice(i, i + 2) === '}}') {
                braceLevel--; i++;
                if (braceLevel === 0) {
                    endIdx = i;
                    break;
                }
            }
        }

        if (endIdx !== -1) {
            const body = content.slice(startIdx + startTag.length, endIdx - 2).trim();
            results.push({ body, start: startIdx, end: endIdx + 2 });
            pos = endIdx + 2;
            console.log(`🧩 sel_container[${results.length - 1}]:`, {
                start: startIdx,
                end: endIdx + 2,
                body,
            });
        } else {
            break;
        }
    }

    return results;
}

// parseWikiContentFragment → extractSelContainers を使わず、1コンテナだけ直接処理する
function parseWikiContentFragment(containerBlock: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];

    const rowRe = /#sel_row\s*\{\{([\s\S]*?)\}\}/g;
    const rowItems: React.ReactNode[] = [];
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRe.exec(containerBlock))) {
        const rowBody = rowMatch[1];

        const contentRe = /&sel_content(?:\(([^)]*)\))?\{([\s\S]*?)\};?/g;
        const selContents: React.ReactNode[] = [];
        let contentMatch: RegExpExecArray | null;

        while ((contentMatch = contentRe.exec(rowBody))) {
            const [, type, inner] = contentMatch;
            selContents.push(
                <SelContent key={`sel-${rowMatch.index}-${contentMatch.index}`} type={type?.trim() || ''}>
                    {inner.trim()}
                </SelContent>
            );
            console.log(`📋 sel_row[${rowMatch?.index}]:`, {
                raw: rowBody,
            });
            console.log(`  ↪ sel_content:`, {
                type,
                inner,
            });
        }

        rowItems.push(<SelRow key={`sel-row-${rowMatch.index}`}>{selContents}</SelRow>);
    }

    nodes.push(<SelContainer key="sel-container">{rowItems}</SelContainer>);
    return nodes;
}

function Fold({
    title,
    initiallyOpen,
    children
}: {
    title: React.ReactNode;
    initiallyOpen: boolean;
    children: React.ReactNode;
}){
    const [open, setOpen] = useState(initiallyOpen)
    const iconPath = open
        ? "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM128 240l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
        : "M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM208 352l0-80-80 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l80 0 0-80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 80 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-80 0 0 80c0 8.8-7.2 16-16 16s-16-7.2-16-16z";
    return(
        <div style={{ margin: '8px 0' }}>
            <button onClick={() => setOpen(!open)} style={{backgroundColor: 'initial', border: 'none', color: 'inherit', cursor: 'pointer', display: 'block', float: 'left', fontSize: '22px', lineHeight: '1em', margin: '-1px 0', padding: '0'}}>
                <svg style={{ height: '1em', verticalAlign: '-0.125em' }}aria-hidden="true" focusable="false" data-prefix="fal" data-icon="square-minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                    <path fill="currentColor" d={iconPath}></path>
                </svg>
            </button>
            <div style={{ display: open ? 'none' : 'block', marginLeft: '28px' }}>
                {title}
            </div>
            <div style={{ display: open ? 'block' : 'none', marginLeft: '28px' }}>
                {children}
            </div>
        </div>
    )
}
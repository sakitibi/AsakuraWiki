import React, { ReactNode } from 'react';
import Calendar2 from '@/components/plugins/Calendar2';
import CommentForm from '@/components/plugins/CommentForm';
import RealTimeComments from '@/components/plugins/RealTimeComments';
import PageList from '@/components/plugins/PageList';
import PageList2 from '@/components/plugins/PageList2';
import IncludePage from '@/components/plugins/IncludePage';
import calcPlugin from '@/components/plugins/calcPlugin';
import { DATEDIF, DATEVALUE } from '@/utils/dateFunctions';
import { extractBracedBlock, isValidLineRange } from "@/utils/parsePlugins";
import { isSafari } from "@/pages/wiki/[wikiSlug]/[[...pageSlug]]";
import versions from "@/utils/version";
import { PluginArgs } from '@/components/plugins/ParseOtherInline/types';

const safeTrim = (v: unknown) => typeof v === 'string' ? v.trim() : '';

type ParserFn = (line: string, wikiSlug: string, pageSlug: string, context: any, baseKey: number, designColor: any) => ReactNode[];

export const renderMarquee = ({ key, match }: PluginArgs): ReactNode => {
    const [, text, loop, slide, bgColor, color, size] = match;
    const fontSize = size ? `${size}px` : 'inherit';
    const iterationCount = loop && /^\d+$/.test(loop) ? Number(loop) : 'infinite';

    let sizeSuffix: 'xl' | 'sm' | 'md' = 'xl';
    if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        if (screenWidth < 700) sizeSuffix = 'sm';
        else if (screenWidth < 1000) sizeSuffix = 'md';
    }

    const animationBase = slide === 'slide' ? 'scroll-slide-once' : slide === 'alternate' ? 'scroll-alternate' : 'scroll-default';
    const animationName = `${animationBase}-${sizeSuffix}`;

    const animationStyle: React.CSSProperties = {
        animationName,
        animationDuration: slide === 'slide' ? '5s' : slide === 'alternate' ? '7s' : '15s',
        animationTimingFunction: slide === 'slide' || slide === 'alternate' ? 'ease-in-out' : 'linear',
        animationIterationCount: iterationCount,
        animationDirection: slide === 'alternate' ? 'alternate' : 'normal',
        animationFillMode: slide === 'slide' ? 'forwards' : 'none',
        display: 'inline-block',
    };

    return (
        <div key={key} style={{ overflow: 'hidden', whiteSpace: 'nowrap', backgroundColor: bgColor ?? 'transparent', color: color ?? 'inherit', fontSize }}>
            <div style={animationStyle}>{text}</div>
        </div>
    );
};

export const renderEscape = ({ token, key }: PluginArgs): ReactNode => {
    const braceStart = token.indexOf('{');
    const braceBlock = extractBracedBlock(token, braceStart, 1);
    return <span key={key} dangerouslySetInnerHTML={{ __html: braceBlock.body }} />;
};

export const renderCalendar2 = ({ key, match }: PluginArgs): ReactNode => {
    const [, y, mo] = match;
    return <Calendar2 key={key} year={+y} month={+mo} />;
};

export const renderDateDif = ({ key, match }: PluginArgs): ReactNode => {
    const [, d1, d2, unit] = match;
    const val = DATEDIF(d1, d2, unit);
    return <span key={key}>{isNaN(val) ? 'ERR' : val}</span>;
};

export const renderDateValue = ({ key, match }: PluginArgs): ReactNode => {
    const [, dateStr] = match;
    const val = DATEVALUE(dateStr);
    return <span key={key}>{isNaN(val) ? 'ERR' : val}</span>;
};

export const renderComment = ({ token, key, wikiSlug, pageSlug }: PluginArgs): ReactNode => {
    const match = token.match(/^#comment(?:\(\s*(above|below)\s*\))?$/);
    const position = match?.[1] === 'below' ? 'below' : 'above';
    return <CommentForm key={key} wikiSlug={wikiSlug} pageSlug={pageSlug} position={position} />;
};

export const renderRtComment = ({ key, wikiSlug, pageSlug }: PluginArgs): ReactNode => (
    <RealTimeComments key={key} wikiSlug={wikiSlug} pageSlug={pageSlug} />
);

export const renderLs = ({ key, match }: PluginArgs): ReactNode => {
    const prefix = safeTrim(match[1]) || undefined;
    return <PageList key={key} prefix={prefix} />;
};

export const renderLs2 = ({ key, match, wikiSlug }: PluginArgs): ReactNode => {
    const pattern = safeTrim(match[1]);
    const opts = match[2]?.split(',').map(s => safeTrim(s)) ?? [];
    const blockOpts = match[3]?.split(',').map(s => safeTrim(s)) ?? [];
    const label = safeTrim(match[4]);
    return <PageList2 key={key} wikiSlug={wikiSlug} pattern={pattern} options={[...opts, ...blockOpts]} label={label} />;
};

export const renderInclude = ({ key, match, wikiSlug, designColor }: PluginArgs): ReactNode => {
    const arg = safeTrim(match[1]!);
    const [first, lineRange, flag] = arg.split(',').map(s => safeTrim(s));
    let showTitle = flag === 'notitle' || flag === 'none' ? false : flag === 'title' ? true : undefined;

    let pageName = first;
    let stylesheetURL: string | undefined;
    if (first.includes('|')) {
        const [name, css] = first.split('|', 2).map(s => safeTrim(s));
        pageName = name;
        stylesheetURL = css;
    }

    if (lineRange && !isValidLineRange(lineRange)) {
        return <div key={key} style={{ color: 'red' }}>読み込み失敗: 無効な行範囲です</div>;
    }
    return <IncludePage key={key} wikiSlug={wikiSlug} page={pageName} showTitle={showTitle} stylesheetURL={stylesheetURL} lineRange={lineRange} designColor={designColor} />;
};

export const renderAlign = (type: 'center' | 'left' | 'right', { key, match, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs, parseOtherInline: ParserFn): ReactNode => {
    const centered = safeTrim(match[1]);
    const inner = parseOtherInline(centered, wikiSlug, pageSlug, context, baseKey + 1, designColor);
    return <div key={key} style={{ textAlign: type }}>{Array.isArray(inner) ? inner : [inner]}</div>;
};

export const renderSize = ({ token, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs, parseOtherInline: ParserFn): ReactNode => {
    const sizeStart = token.indexOf('(');
    const braceStart = token.indexOf('{');
    const fontSize = parseInt(token.slice(sizeStart + 1, braceStart - 1), 10);
    const braceBlock = extractBracedBlock(token, braceStart, 1);

    const hasBlockPlugin = /#accordion|#fold|#sel_container|#sel_row/.test(braceBlock.body);
    const content = hasBlockPlugin ? braceBlock.body : parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1, designColor);

    return <span key={key} style={{ fontSize: `${fontSize}px` }}>{content}</span>;
};

export const renderColor = ({ token, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs, parseOtherInline: ParserFn): ReactNode => {
    const parenStart = token.indexOf('(');
    const parenEnd = token.indexOf(')', parenStart);
    const braceStart = token.indexOf('{');
    if (parenEnd === -1 || braceStart === -1) {
        return <span key={key} style={{ color: 'red' }}>構文エラー: &color 構文不正</span>;
    }
    const braceBlock = extractBracedBlock(token, braceStart, 1);
    const args = token.slice(parenStart + 1, parenEnd).split(',').map(s => safeTrim(s));
    const [color, background] = args;
    const content = parseOtherInline(braceBlock.body, wikiSlug, pageSlug, context, baseKey + 1, designColor);

    return (
        <span key={key} style={{ ...(color ? { color } : {}), ...(background ? { backgroundColor: background } : {}) }}>
            {Array.isArray(content) ? content : [content]}
        </span>
    );
};

export const renderLink = ({ token, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs, parseOtherInline: ParserFn): ReactNode => {
    const labeledLink = token.match(/\[\[([^\]>]+)>([^\]]+)\]\]/);
    const plainLink = token.match(/\[\[([^\]]+)\]\]/);
    if (labeledLink) {
        const label = labeledLink[1].trim();
        const url = labeledLink[2].trim();
        const inner = parseOtherInline(label, wikiSlug, pageSlug, context, baseKey + 1, designColor);
        return <a key={key} href={url}>{inner}</a>;
    } else if (plainLink) {
        const url = plainLink[1].trim();
        return <a key={key} href={url}>{url}</a>;
    }
    return token;
};

export const renderAttachRef = ({ match, key }: PluginArgs): ReactNode => {
    const [, url, width, height] = match;
    return <img key={key} src={url} width={parseInt(width, 10)} height={parseInt(height, 10)} alt={url} />;
};

export const renderConst = ({ key, match, context }: PluginArgs): ReactNode => {
    const varName = match[1].trim();
    const varType = match[2].trim();
    const varValue = match[3].trim();
    context.constContext = context.constContext ?? {};

    if (varName in context.constContext) {
        return <span key={key} style={{ color: 'red' }}>定数 {varName} は再定義不可！</span>;
    }
    context.constContext[varName] = varValue;
    return <span key={key} style={{ display: 'none', fontWeight: 'bold' }}>定数 {varName}（{varType}） = {varValue}</span>;
};

export const renderLet = ({ key, match, context }: PluginArgs): ReactNode => {
    const varName = match[1].trim();
    const varType = match[2].trim();
    const varValue = match[3].trim();
    context.letContext = context.letContext ?? {};
    context.letContext[varName] = varValue;
    return <span key={key} style={{ display: 'none', fontStyle: 'italic' }}>変数 {varName}（{varType}） ← {varValue}</span>;
};

export const renderConstUse = ({ key, match, context }: PluginArgs): ReactNode => {
    const varName = match[1].trim();
    return <span key={key}>{context.constContext?.[varName] ?? `[定数未定義:${varName}]`}</span>;
};

export const renderLetUse = ({ key, match, context }: PluginArgs): ReactNode => {
    const varName = match[1].trim();
    return <span key={key}>{context.letContext?.[varName] ?? `[変数未定義:${varName}]`}</span>;
};

export const renderRelet = ({ key, match, context }: PluginArgs): ReactNode => {
    const varName = match[1].trim();
    if (context.letContext?.[varName]) {
        return <span key={key} style={{ display: 'none' }}>再代入OK: {varName}</span>;
    }
    return <span key={key} style={{ color: 'red' }}>再代入対象 `{varName}` が未定義です</span>;
};

export const renderCalc = ({ key, match, context }: PluginArgs): ReactNode => {
    const args = match[1].split(',').map(s => s.trim());
    const [expression, decStr, style, intStr] = args;
    const decimals = decStr !== undefined ? Number(decStr) : 0;
    const integers = intStr !== undefined ? Number(intStr) : undefined;
    const resolvedExpr = expression.replace(/\b[a-zA-Z_]\w*\b/g, varName => context.constContext?.[varName] ?? context.letContext?.[varName] ?? varName);
    try {
        const result = calcPlugin(resolvedExpr, decimals, style, integers);
        return <span key={key}>{result}</span>;
    } catch {
        return <span key={key} style={{ color: 'red' }}>計算失敗</span>;
    }
};

export const renderVersion = ({ key, match }: PluginArgs): ReactNode => {
    const type = match[1];
    const value = versions[parseInt(type, 10)];
    return <span key={key}>{value ?? `[未定義のversion:${type}]`}</span>;
};

export const renderNew = ({ key, match, baseKey }: PluginArgs): ReactNode => {
    if (isSafari()) return null;
    const args = match[1]?.split(',').map(s => s.trim()) ?? [];
    const dateStr = match[2]?.trim();
    const keyStr = `inl-${baseKey}-${match.index}`;

    const parsedDate = new Date(dateStr.replace(/\(.*?\)/, '').trim());
    if (isNaN(parsedDate.getTime())) {
        return <span key={keyStr} style={{ color: 'red' }}>日付形式エラー</span>;
    }

    const diffDays = (new Date().getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    let label = diffDays <= 1 ? 'New!' : diffDays <= 5 ? 'New' : '';
    const showDate = !args.includes('nodate');

    return (
        <span key={keyStr} style={{ fontWeight: 'bold', fontSize: '80%' }}>
            {showDate ? dateStr : ''}{' '}
            <span style={{ color: diffDays <= 1 ? 'red' : diffDays <= 3 ? 'orange' : diffDays <= 5 ? 'green' : 'inherit' }}>
                {label}
            </span>
        </span>
    );
};

export const renderFunc = ({ token, key, context }: PluginArgs): ReactNode => {
    return (
        <span key={key} style={{ display: 'none' }} />
    );
};

export const renderArg = ({ match, key, context }: PluginArgs): ReactNode => {
    const argName = match[1]?.trim();
    const val = context.currentArgs?.[argName] ?? '';
    return <React.Fragment key={key}>{val}</React.Fragment>;
};

export const renderReturnCustom = (
    { match, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs,
    bodyText: string | null,
    parseOtherInline: ParserFn
): ReactNode => {
    // カッコ指定があるパターン: &return(関数名, 引数1, 引数2...) のマクロ呼び出し・展開
    if (match[1]) {
        const rawArgs = match[1].split(',').map(s => safeTrim(s));
        const funcName = rawArgs[0];
        const callArgs = rawArgs.slice(1);

        const funcDef = context.funcContext?.[funcName];
        
        if (!funcDef) {
            console.error(
                `%c[&return エラー] 関数 "${funcName}" の呼び出しに失敗しました。定義が見つかりません。`,
                'color: #ffffff; background: #e91e63; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
                {
                    requestedFuncName: funcName,
                    availableFunctions: context.funcContext ? Object.keys(context.funcContext) : 'funcContext自体が未定義',
                    fullContextSnapshot: { ...context }
                }
            );
            return <span key={key} style={{ color: 'red' }}>エラー: 関数 `{funcName}` が定義されていません</span>;
        }

        console.log(
            `%c[&return 展開開始] 関数名: ${funcName}`, 
            'color: #ffffff; background: #4caf50; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
            { callArgs, resolvedBody: funcDef.body }
        );

        // 現在の引数スコープをスタック退避 (Save)
        const savedArgs = context.currentArgs ? { ...context.currentArgs } : undefined;

        // 引数のマッピングと環境への束縛 (Bind)
        const nextArgs: Record<string, string> = {};
        funcDef.argNames.forEach((argName, index) => {
            nextArgs[argName] = callArgs[index] !== undefined ? callArgs[index] : '';
        });
        context.currentArgs = nextArgs;

        // マクロ本体(body)を入れ子を維持したまま再帰的にパース
        let content: ReactNode[] = [];
        try {
            const bodyLines = funcDef.body.split('\n');
            
            bodyLines.forEach((line: string, i: number) => {
                if (line.trim() === '' && i === bodyLines.length - 1) return; 

                const lineNodes = parseOtherInline(line, wikiSlug, pageSlug, context, baseKey + 1000 + (i * 10), designColor);
                content.push(...lineNodes);

                if (i < bodyLines.length - 1) {
                    content.push(<br key={`br-${baseKey}-${i}`} />);
                }
            });
        } catch (e) {
            context.currentArgs = savedArgs;
            return <span key={key} style={{ color: 'red' }}>エラー: 関数 `{funcName}` の展開に失敗しました</span>;
        }

        context.currentArgs = savedArgs;

        return <React.Fragment key={key}>{content}</React.Fragment>;
    } 
    
    if (bodyText !== null) {
        const content = parseOtherInline(bodyText, wikiSlug, pageSlug, context, baseKey + 1, designColor);
        return <React.Fragment key={key}>{Array.isArray(content) ? content : [content]}</React.Fragment>;
    }

    return null;
};

// 従来のフック定義を維持するための互換用フォールバック
export const renderReturn = (args: PluginArgs, parseOtherInline: ParserFn): ReactNode => {
    return renderReturnCustom(args, null, parseOtherInline);
};
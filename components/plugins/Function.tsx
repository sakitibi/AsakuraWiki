import React, { ReactNode } from "react";
import { PluginArgs } from "@/components/plugins/ParseOtherInline/types";
import { safeTrim } from "@/components/plugins/ParseOtherInline/pluginRenderers";

export type ParserFn = (
    line: string,
    wikiSlug: string,
    pageSlug: string,
    context: any,
    baseKey: number,
    designColor: any
) => ReactNode[];

export const renderFunc = ({ token, key, context }: PluginArgs): ReactNode => {
    return (
        <span key={key} style={{ display: 'none' }}>{key}</span>
    );
};

export const renderArg = (
    { match, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs, 
    parseOtherInline: ParserFn
): ReactNode => {
    const argName = match[1]?.trim();
    const val = context.currentArgs?.[argName] ?? '';
    
    const parsedContent = parseOtherInline(val, wikiSlug, pageSlug, context, baseKey + 500, designColor);
    
    return <React.Fragment key={key}>{parsedContent}</React.Fragment>;
};

export const renderReturnCustom = (
    { match, key, wikiSlug, pageSlug, context, baseKey, designColor }: PluginArgs,
    bodyText: string | null,
    parseOtherInline: ParserFn
): ReactNode => {
    // カッコ指定があるパターン: &return(関数名, 引数1, 引数2...) のマクロ呼び出し・展開
    if (match[1]) {
        const rawArgsStr = match[1];
        const callArgs: string[] = [];
        
        // カンマ区切りだが、プラグイン内の () や {} のカンマでちぎれないようにネストを解析して分割
        let currentArg = '';
        let parenDepth = 0;
        let braceDepth = 0;

        for (let i = 0; i < rawArgsStr.length; i++) {
            const char = rawArgsStr[i];

            if (char === '(') parenDepth++;
            else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
            else if (char === '{') braceDepth++;
            else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);

            // ネストの外側にあるカンマにぶつかったら、そこまでの文字列を一つの引数として確定
            if (char === ',' && parenDepth === 0 && braceDepth === 0) {
                callArgs.push(safeTrim(currentArg));
                currentArg = '';
            } else {
                currentArg += char;
            }
        }
        // 最後の引数を追加
        callArgs.push(safeTrim(currentArg));

        // 1番目は関数名、2番目以降が実際の引数
        const funcName = callArgs[0];
        const actualCallArgs = callArgs.slice(1);

        const funcDef = context.funcContext?.[funcName];
        
        if (!funcDef) {
            console.error(
                `%c[&return エラー] 関数 "${funcName}" の定義が見つかりません。`,
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
            { actualCallArgs, resolvedBody: funcDef.body }
        );

        // 現在の引数スコープをスタック退避 (Save)
        const savedArgs = context.currentArgs ? { ...context.currentArgs } : undefined;

        // 引数のマッピングと環境への束縛 (Bind)
        const nextArgs: Record<string, string> = {};
        const argNamesLen = funcDef.argNames.length;
        for (let i = argNamesLen - 1;i >= 0;i--) {
            // 分割された正しい引数を割り当てる
            nextArgs[funcDef.argNames[i]] = actualCallArgs[i] !== undefined ? actualCallArgs[i] : '';
        };
        context.currentArgs = nextArgs;

        // マクロ本体(body)を入れ子を維持したまま再帰的にパース
        let content: ReactNode[] = [];
        try {
            const bodyLines = funcDef.body.split('\n');
            const bodyLinesLen = bodyLines.length;
            for (let i = 0;i < bodyLinesLen;i++) {
                if (bodyLines[i].trim() === '' && i === bodyLines.length - 1) continue; 

                const lineNodes = parseOtherInline(
                    bodyLines[i],
                    wikiSlug,
                    pageSlug,
                    context,
                    baseKey + 1000 + (i * 10),
                    designColor
                );
                content.push(...lineNodes);

                if (i < bodyLines.length - 1) {
                    content.push(<br key={`br-${baseKey}-${i}`} />);
                }
            };
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
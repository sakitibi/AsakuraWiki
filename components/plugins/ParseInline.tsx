import Header from "@/components/plugins/Header";
import type { Context } from "@/components/plugins/parsePluginTypes";
import type { ReactNode } from "react";
import parseOtherInline, { preProcessFuncDefinitions } from "@/components/plugins/ParseOtherInline";
import { designColor } from "@/utils/wiki_settings";

interface parseInlineProps{
    text: string;
    context: Context;
    designColor: designColor
}

export default function parseInline({text, context, designColor}: parseInlineProps): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let nodeKey:number = 0;
    
    console.log("text: ", text);

    context.funcContext = context.funcContext ?? {};

    const cleanedText = preProcessFuncDefinitions(text, context);

    console.log(
        `%c[parseInline] 事前処理通過後の登録関数一覧:`, 
        'color: #ffffff; background: #9c27b0; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
        Object.keys(context.funcContext)
    );

    // 4) 関数定義が取り除かれたクリーンなテキスト（cleanedText）を1行ずつ分割する
    const lines = cleanedText.split(/\r?\n/);
    
    for (let i = 0; i < lines.length; i++){
        // 1) 見出しか?（*テキスト [anchor] に対応）
        console.log('[line]', JSON.stringify(lines[i]));
        const headingMatch = lines[i].match(/^(\*{1,3})\s*(.+?)(?:\s*\[(.+?)\])?$/);
        if (headingMatch) {
            const stars:"*" | "**" | "***" = headingMatch[1] as "*" | "**" | "***";
            const title:string = headingMatch[2].trim();
            const anchor:string = headingMatch[3]?.trim() ?? "";

            nodes.push(
                <Header
                    key={`hdr-${nodeKey++}`}
                    level={stars}
                    title={title}
                    anchor={anchor}
                    designColor={designColor}
                />
            );
            continue;
        }

        // 2) その他の行のインライン解析
        const parsedLine:ReactNode[] = parseOtherInline(
            lines[i],
            wikiSlug!,
            pageSlug!,
            context,
            nodeKey,
            designColor
        );
        nodes.push(...parsedLine);
        nodeKey += parsedLine.length || 1;
    };

    return nodes;
}
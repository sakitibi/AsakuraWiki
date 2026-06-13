import Header from "@/components/plugins/Header";
import type { Context } from "@/components/plugins/parsePluginTypes";
import type { ReactNode } from "react";
import parseOtherInline from "@/components/plugins/ParseOtherInline";
import { designColor } from "@/utils/wiki_settings";

interface parseInlineProps{
    text: string;
    context: Context;
    designColor: designColor
}

/** インラインプラグインを処理します */
export default function parseInline({text, context, designColor}: parseInlineProps): React.ReactNode[] {
    const { wikiSlug, pageSlug } = context;
    const nodes: React.ReactNode[] = [];
    let nodeKey:number = 0;
    console.log("text: ", text);
    text.split(/\r?\n/).forEach((line) => {
        // 1) 見出しか?（*テキスト [anchor] に対応）
        console.log('[line]', JSON.stringify(line));
        const headingMatch = line.match(/^(\*{1,3})\s*(.+?)(?:\s*\[(.+?)\])?$/);
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
            return;
        }

        // 2) その他の行のインライン解析
        const parsedLine:ReactNode[] = parseOtherInline(
            line,
            wikiSlug!,
            pageSlug!,
            context,
            nodeKey,
            designColor
        );
        nodes.push(...parsedLine);
        nodeKey += parsedLine.length || 1;
    });

    return nodes;
}
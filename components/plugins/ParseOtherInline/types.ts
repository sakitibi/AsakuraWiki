import { designColor } from "@/utils/wiki_settings";
import type { Context as BaseContext } from "@/components/plugins/parsePluginTypes";

// 関数の構造定義
export interface FuncDefinition {
    argNames: string[];
    body: string;
}

export interface ExtendedContext extends BaseContext {
    letContext?: Record<string, string>;
    constContext?: Record<string, string>;
    funcContext?: Record<string, FuncDefinition>;
    currentArgs?: Record<string, string>;
}

export interface PluginArgs {
    token: string;
    key: string;
    match: RegExpExecArray;
    wikiSlug: string;
    pageSlug: string;
    context: ExtendedContext;
    baseKey: number;
    designColor: designColor;
}
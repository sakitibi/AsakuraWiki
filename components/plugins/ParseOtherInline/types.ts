import { designColor } from "@/utils/wiki_settings";
import type { Context as BaseContext } from "@/components/plugins/parsePluginTypes";

export interface ExtendedContext extends BaseContext {
    letContext?: Record<string, string>;
    constContext?: Record<string, string>;
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
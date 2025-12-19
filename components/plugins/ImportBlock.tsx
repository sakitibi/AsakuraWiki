import { supabaseServer } from '@/lib/supabaseClientServer';
import { Context, ImportBlockProps, injectConstBlocksProps } from '@/components/plugins/parsePluginTypes';
import Pako from 'pako';
import { hexByteaToUint8Array } from '@/utils/wikiFetch';

// 例: #import(13ninstudio:module){ninki,kitikura-world}
export const parseImport = (line: string) => {
    const match:RegExpMatchArray | null = line.match(/#import\((.+?):(.+?)\)\{(.+?)\}/);
    if (!match) return null;
    const [, wikiSlug, pageSlug, vars] = match;
    const variables:string[] = vars.split(',').map(v => v.trim());
    return { wikiSlug, pageSlug, variables };
};

function injectConstBlocks(variables: injectConstBlocksProps[]): string {
    return variables
        .map(({ name, value, type, kind }) => `#${kind}(${name}:${type}){${value}};`)
        .join('\n');
}

export async function resolveImports(content: string, context: Context): Promise<string> {
    console.log("resolveImports called");
    const importRe:RegExp = /#import\(([^:]+):([^)]+)\)\{(.+?)\};/g;
    let match: RegExpExecArray | null;

    while ((match = importRe.exec(content))) {
        const [, wikiSlug, pageSlug, rawVars] = match;
        const requestedVars = rawVars.split(',').map((v: string) => v.trim());

        const { data: pageData, error: pageError } = await supabaseServer
            .from('wiki_pages')
            .select('content')
            .eq('wiki_slug', wikiSlug)
            .eq('slug', pageSlug)
            .single();

        if (pageError || !pageData?.content) continue;
        const compressed = hexByteaToUint8Array(pageData?.content);
        let decompressedContent = Pako.ungzip(compressed, { to: "string" });
        const exportMatch:RegExpMatchArray | null = decompressedContent.match(/#export\((global|local)\)\{(.+?)\};/);
        if (!exportMatch) continue;
        const exportScope:string = exportMatch[1]; // ← global or local
        const exportedVars:string[] = exportMatch[2].split(',').map((v: string) => v.trim());
        const validVars:string[] = requestedVars.filter(v => exportedVars.includes(v));
        if (exportScope === 'local' && wikiSlug !== context.wikiSlug) {
            continue; // スコープ外なのでスキップ
        }
        // ✅ local の場合は wikiSlug が一致しているか確認
        if (validVars.length === 0) continue;

        const { data: varData } = await supabaseServer
            .from('wiki_variables')
            .select('name, value, type, kind')
            .eq('wiki_slug', wikiSlug)
            .in('name', validVars);

        if (!varData) continue;

        // context に代入（const と let 両対応）
        context.constContext = context.constContext ?? {};
        context.letContext = context.letContext ?? {};

        for (const { name, value, kind } of varData) {
            context.variables![name] = value;
            if (kind === 'const') {
                if (!(name in context.constContext)) {
                    context.constContext[name] = value;
                }
            } else if (kind === 'let') {
                context.letContext[name] = value; // ← 再代入OK
            } else if(kind === 'function') {/*TODO: functionをimportした時の処理を書く*/}
        }

        // content に挿入
        const injectedBlock:string = injectConstBlocks(varData);
        content = content.replace(match[0], injectedBlock);
    }

    return content;
}

export default function ImportBlock({
    slug,
    page,
    variables,
}: ImportBlockProps) {
    return (
        <div style={{
            border: '1px dotted #888',
            padding: '0.5em',
            marginBottom: '1em',
            display: 'none' }}
        >
            <strong>Import from {slug}:{page}</strong> → {variables.join(', ')}
        </div>
    );
}

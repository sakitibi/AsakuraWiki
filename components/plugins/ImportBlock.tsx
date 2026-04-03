import { supabaseClient } from '@/lib/supabaseClient';
import { Context, ImportBlockProps } from '@/components/plugins/parsePluginTypes';
import Pako from 'pako';

/**
 * Base64をUint8Arrayに変換 (Blobデータ用)
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

export const parseImport = (line: string) => {
    const match: RegExpMatchArray | null = line.match(/#import\((.+?):(.+?)\)\{(.+?)\}/);
    if (!match) return null;
    const [, wikiSlug, pageSlug, vars] = match;
    const variables: string[] = vars.split(',').map(v => v.trim());
    return { wikiSlug, pageSlug, variables };
};

function injectConstBlocks(variables: any[]): string {
    return variables
        .map(({ name, value, type, kind }) => `#${kind}(${name}:${type}){${value}};`)
        .join('\n');
}

export async function resolveImports(content: string, context: Context): Promise<string | undefined> {
    try {
        console.log("resolveImports called");
        const importRe: RegExp = /#import\(([^:]+):([^)]+)\)\{(.+?)\};/g;
        let match: RegExpExecArray | null;

        while ((match = importRe.exec(content))) {
            const [, wikiSlug, pageSlug, rawVars] = match;
            const requestedVars = rawVars.split(',').map((v: string) => v.trim());

            // --- 修正ポイント: 自作API v2 からページデータを取得 ---
            const response = await fetch(`/api/wiki_v2/${wikiSlug}/${pageSlug}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.warn(`Import failed: Page ${wikiSlug}/${pageSlug} not found.`);
                continue;
            }

            const pageData = await response.json();
            
            // content (Base64 + Gzip) を解凍
            const compressed = base64ToUint8Array(pageData.content);
            const decompressedContent = Pako.ungzip(compressed, { to: "string" });

            // #export を探すロジックは維持
            const exportMatch: RegExpMatchArray | null = decompressedContent.match(/#export\((global|local)\)\{(.+?)\};/);
            if (!exportMatch) continue;

            const exportScope: string = exportMatch[1]; 
            const exportedVars: string[] = exportMatch[2].split(',').map((v: string) => v.trim());
            const validVars: string[] = requestedVars.filter(v => exportedVars.includes(v));

            if (exportScope === 'local' && wikiSlug !== context.wikiSlug) {
                continue; 
            }

            if (validVars.length === 0) continue;

            // 変数の実体取得（メタデータなので引き続きSupabaseを利用）
            const { data: varData } = await supabaseClient
                .from('wiki_variables')
                .select('name, value, type, kind')
                .eq('wiki_slug', wikiSlug)
                .in('name', validVars);

            if (!varData) continue;

            context.variables = context.variables ?? {};
            context.constContext = context.constContext ?? {};
            context.letContext = context.letContext ?? {};

            for (const { name, value, kind } of varData) {
                context.variables[name] = value;
                if (kind === 'const') {
                    if (!(name in context.constContext)) {
                        context.constContext[name] = value;
                    }
                } else if (kind === 'let') {
                    context.letContext[name] = value;
                }
                // TODO: functionをimportした時の処理
            }

            const injectedBlock: string = injectConstBlocks(varData);
            content = content.replace(match[0], injectedBlock);
        }

        return content;
    } catch (e) {
        console.error("resolveImportsError: ", e);
    }
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
            display: 'none'
        }}>
            <strong>Import from {slug}:{page}</strong> → {variables.join(', ')}
        </div>
    );
}
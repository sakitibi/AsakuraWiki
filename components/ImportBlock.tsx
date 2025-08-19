import { getVariableValues, getExportedVariables } from '@/components/ExportBlock';
import { supabaseServer } from '@/lib/supabaseClientBrowser';
import { Context, ImportBlockProps } from '@/components/parsePluginTypes';

// 例: #import(13ninstudio:module){ninki,kitikura-world}
export const parseImport = (line: string) => {
    const match = line.match(/#import\((.+?):(.+?)\)\{(.+?)\}/);
    if (!match) return null;
    const [, wikiSlug, pageSlug, vars] = match;
    const variables = vars.split(',').map(v => v.trim());
    return { wikiSlug, pageSlug, variables };
};

export const injectVariables = (variables: Record<string, string>) => {
    return Object.entries(variables)
        .map(([name, value]) => `#const ${name} = ${value}`)
        .join('\n');
};

export const processImport = async (line: string) => {
    const parsed = parseImport(line);
    if (!parsed) return '';

    const exported = await getExportedVariables(parsed.wikiSlug, parsed.pageSlug);
    const validVars = parsed.variables.filter(v => exported.includes(v));
    const values = await getVariableValues(parsed.wikiSlug, validVars);

    return injectVariables(values); // ← #const で挿入
};

export async function resolveImports(content: string, context: Context) {
    const importRe = /#import\(([^:]+):([^)]+)\)\{(.+?)\};/g;
    let match: RegExpExecArray | null;

    while ((match = importRe.exec(content))) {
        const [, wikiSlug, pageSlug, rawVars] = match;
        const requestedVars = rawVars.split(',').map((v: string) => v.trim());

        // 対象ページの content を取得
        const { data: pageData, error: pageError } = await supabaseServer
            .from('wikis')
            .select('content')
            .eq('wiki_slug', wikiSlug)
            .eq('slug', pageSlug)
            .single();

        if (pageError || !pageData?.content) continue;

        // 対象ページの #export を抽出
        const exportMatch = pageData.content.match(/#export\((global|local)\)\{(.+?)\};/);
        if (!exportMatch) continue;

        const exportedVars = exportMatch[2].split(',').map((v: string) => v.trim());
        const validVars = requestedVars.filter(v => exportedVars.includes(v));

        if (validVars.length === 0) continue;

        // wiki_variables テーブルから値を取得
        const { data: varData } = await supabaseServer
            .from('wiki_variables')
            .select('name, value')
            .eq('wiki_slug', wikiSlug)
            .in('name', validVars);

        if (!varData) continue;

        for (const { name, value } of varData) {
            context.variables[name] = value;
        }
    }
}

export default function ImportBlock({
    slug,
    page,
    variables,
}: ImportBlockProps) {
    return (
        <div style={{ border: '1px dotted #888', padding: '0.5em', marginBottom: '1em', display: 'none' }}>
            <strong>Import from {slug}:{page}</strong> → {variables.join(', ')}
        </div>
    );
}

import { supabaseServer } from '@/lib/supabaseClientServer';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface ExportBlockProps{
    scope: 'global' | 'local';
    variables: string[];
}

interface ExportedVariable {
    name: string;
    value: string;
    kind: 'const' | 'let' | 'function';
    scope: 'global' | 'local';
    type: string;
}

export const getExportedVariables = async (wikiSlug: string, pageSlug: string) => {
    const { data } = await supabaseServer
        .from('wiki_pages')
        .select('content')
        .eq('wiki_slug', wikiSlug)
        .eq('slug', pageSlug)
        .single();

    const exportMatch:string = data?.content.match(/#export\((global|local)\)\{(.+?)\}/);
    if (!exportMatch) return [];

    const [, _scope, vars] = exportMatch;
    return vars.split(',').map((v: string) => v.trim());
};

export const getVariableValues = async (wikiSlug: string, variables: string[]) => {
    const { data } = await supabaseServer
        .from('wiki_variables')
        .select('name, value')
        .eq('wiki_slug', wikiSlug)
        .in('name', variables);

    return Object.fromEntries(data!.map(({ name, value }) => [name, value]));
};

export const getExportedVariablesWithDefaults = async (
    wikiSlug: string,
    pageSlug: string
): Promise<ExportedVariable[]> => {
    const { data } = await supabaseServer
        .from('wiki_pages')
        .select('content')
        .eq('wiki_slug', wikiSlug)
        .eq('slug', pageSlug)
        .single();

    const content = data?.content ?? '';
    const exportMatch = content.match(/#export\((global|local)\)\{(.+?)\}/);
    if (!exportMatch) return [];

    const [, scope, vars] = exportMatch;
    const variableNames = vars.split(',').map((v: string) => v.trim());

    const defaults: Record<string, string> = {};
    const kinds: Record<string, 'const' | 'let'> = {};
    const types: Record<string, string> = {};

    for (const name of variableNames) {
        const constMatch = content.match(new RegExp(`#const\\(${name}:([^)]+)\\)\\{([^}]+)\\}`));
        const letMatch = content.match(new RegExp(`#let\\(${name}:([^)]+)\\)\\{([^}]+)\\}`));

        if (constMatch) {
            types[name] = constMatch[1] ?? 'string';         // ← 型情報
            defaults[name] = constMatch[2];      // ← 値
            kinds[name] = 'const';
        } else if (letMatch) {
            types[name] = letMatch[1] ?? 'string';
            defaults[name] = letMatch[2];
            kinds[name] = 'let';
        } else {
            types[name] = constMatch[1] ?? 'string';              // ← デフォルト型
            defaults[name] = '';
            kinds[name] = 'const';
        }
    }
    return variableNames.map((name: string) => ({
        name,
        value: defaults[name],
        scope,
        kind: kinds[name],
        type: types[name],
    }));
};

export default function ExportBlock({
    scope,
    variables,
}: ExportBlockProps) {
    const router = useRouter();
    useEffect(() => {
        const wikiSlug = router.query.wikiSlug as string;
        const pageSlug = router.query.pageSlug as string;

        if (!wikiSlug || !pageSlug) return;

        async function saveVariables() {
            const exported = await getExportedVariablesWithDefaults(wikiSlug, pageSlug);
            const payload = exported.map(({ name, value, kind, scope, type }) => ({
                wiki_slug: wikiSlug,
                name,
                value,
                scope,
                kind,
                type,
                page_slug: pageSlug,
            }));

            const { error } = await supabaseServer
                .from('wiki_variables')
                .upsert(payload, {
                    onConflict: 'wiki_slug,name,page_slug'
                });

            if (error) {
                console.error('Export failed:', error.message);
            } else {
                console.log('Export success:', payload);
            }
        }

        saveVariables();
    }, [router.query.wikiSlug, router.query.pageSlug]);

    return (
        <div style={{ border: '1px dashed #aaa', padding: '0.5em', marginBottom: '1em', display: 'none' }}>
            <strong>Export ({scope}):</strong> {variables.join(', ')}
        </div>
    );
}

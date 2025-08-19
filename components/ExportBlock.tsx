import React from 'react';
import { supabaseServer } from '@/lib/supabaseClientBrowser';

interface ExportBlockProps{
    scope: 'global' | 'local';
    variables: string[];
}

export const getExportedVariables = async (wikiSlug: string, pageSlug: string) => {
    const { data } = await supabaseServer
        .from('wikis')
        .select('content')
        .eq('wiki_slug', wikiSlug)
        .eq('slug', pageSlug)
        .single();

    const exportMatch = data?.content.match(/#export\((global|local)\)\{(.+?)\}/);
    if (!exportMatch) return [];

    const [, scope, vars] = exportMatch;
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

export default function ExportBlock({
    scope,
    variables,
}: ExportBlockProps) {
    return (
        <div style={{ border: '1px dashed #aaa', padding: '0.5em', marginBottom: '1em', display: 'none' }}>
            <strong>Export ({scope}):</strong> {variables.join(', ')}
        </div>
    );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '@/lib/supabaseClient'; // クライアント用
import Pako from 'pako';

interface ExportBlockProps {
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

/**
 * API v2 からデータを取得し、デコードしてテキストとして返す
 */
const fetchPageContentV2 = async (wikiSlug: string, pageSlug: string): Promise<string> => {
    try {
        const res = await fetch(`/api/wiki_v2/${wikiSlug}/${pageSlug}`);
        if (!res.ok) return '';
        const data = await res.json();

        if (!data.content) return '';

        // Base64デコード -> Uint8Array変換 -> Gzip解凍
        const binaryString = atob(data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return Pako.ungzip(bytes, { to: 'string' });
    } catch (err) {
        console.error('Fetch Error (v2):', err);
        return '';
    }
};

/**
 * 本文から変数を解析・抽出する
 */
export const getExportedVariablesWithDefaults = async (
    wikiSlug: string,
    pageSlug: string
): Promise<ExportedVariable[]> => {
    const content = await fetchPageContentV2(wikiSlug, pageSlug);
    if (!content) return [];

    // 本文内の #export(scope){vars} を解析して scope を特定する
    const exportMatch = content.match(/#export\((global|local)\)\{(.+?)\}/);
    if (!exportMatch) return [];

    const [, parsedScope, vars] = exportMatch;
    const variableNames = vars.split(',').map((v: string) => v.trim());

    return variableNames.map((name) => {
        const constMatch = content.match(new RegExp(`#const\\(${name}:([^)]+)\\)\\{([^}]+)\\}`));
        const letMatch = content.match(new RegExp(`#let\\(${name}:([^)]+)\\)\\{([^}]+)\\}`));

        let type = 'string';
        let value = '';
        let kind: 'const' | 'let' = 'const';

        if (constMatch) {
            type = constMatch[1] ?? 'string';
            value = constMatch[2];
            kind = 'const';
        } else if (letMatch) {
            type = letMatch[1] ?? 'string';
            value = letMatch[2];
            kind = 'let';
        }

        return {
            name,
            value,
            scope: parsedScope as 'global' | 'local', // 本文から解析された実態を優先
            kind,
            type,
        };
    });
};

export default function ExportBlock({ scope: _scope, variables: _variables }: ExportBlockProps) {
    const router = useRouter();

    useEffect(() => {
        const wikiSlug = router.query.wikiSlug as string;
        const pageSlug = router.query.pageSlug as string;

        if (!wikiSlug || !pageSlug) return;

        async function syncVariables() {
            // Blobストレージから最新の本文を取得してパース
            const exported = await getExportedVariablesWithDefaults(wikiSlug, pageSlug);
            if (exported.length === 0) return;

            const payload = exported.map((v) => ({
                wiki_slug: wikiSlug,
                page_slug: pageSlug,
                ...v
            }));

            // 解析結果を Supabase の wiki_variables テーブルへ Upsert
            const { error } = await supabaseClient
                .from('wiki_variables')
                .upsert(payload, {
                    onConflict: 'wiki_slug,name,page_slug'
                });

            if (error) {
                console.error('Variable sync failed:', error.message);
            } else {
                console.log(`Synced ${payload.length} variables for ${pageSlug}`);
            }
        }

        syncVariables();
    }, [router.query.wikiSlug, router.query.pageSlug, _scope, _variables]);

    // ユーザーには見せない隠しロジックコンポーネント
    return null;
}
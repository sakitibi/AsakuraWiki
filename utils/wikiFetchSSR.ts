import { supabaseServer } from '@/lib/supabaseClientServer';
import { Page } from '@/utils/wikiFetch';

export default async function wikiFetchSSR(
    wikiSlug: string,
    pageSlug: string
): Promise<Page | null> {
    const { data, error } = await supabaseServer
        .from('wiki_pages')
        .select('*')
        .eq('wiki_slug', wikiSlug)
        .eq('slug', pageSlug)
        .single();

    if (error || !data) return null;
    return data as Page;
}

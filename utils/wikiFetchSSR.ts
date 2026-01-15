import { supabaseServer } from '@/lib/supabaseClientServer';
import { hexByteaToUint8Array, Page } from '@/utils/wikiFetch';
import Pako from "pako";

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
    // bytea(base64) → Uint8Array → gunzip
    const compressed = hexByteaToUint8Array(data.content);
    const decompressed = Pako.ungzip(compressed, { to: "string" });

    const pageDataResult = {
        ...data,
        content: decompressed
    };

    if (error || !pageDataResult) return null;
    return pageDataResult as Page;
}

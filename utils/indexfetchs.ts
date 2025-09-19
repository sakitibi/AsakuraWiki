import { supabaseServer } from "@/lib/supabaseClientServer";
import type { WikiPage } from "./indexInterfaces";

export async function fetchRecentPages(
    setLoadingRecent: React.Dispatch<React.SetStateAction<boolean>>,
    setRecentPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    const { data, error } = await supabaseServer
        .from('wiki_pages')
        .select(`
            wiki_slug,
            slug,
            updated_at,
            wikis!fk_wiki_slug (
                name,
                slug
            )
        `)
        .order('updated_at', { ascending: false });

    if (error || !data) {
        console.error('fetchRecentPages error:', error)
        setLoadingRecent(false)
        return
    }

    const flattened = data.map((d: any) => ({
        wikiSlug:   d.wiki_slug,
        pageSlug:   d.slug,
        name:       d.wikis?.name ?? '(無名Wiki)',
        updated_at: d.updated_at,
    }))

    const unique = flattened.filter(
        (item, idx, arr) =>
            arr.findIndex(x => x.wikiSlug === item.wikiSlug) === idx
    )

    setRecentPages(unique)
    setPages(unique)
    setLoading(false)
    setLoadingRecent(false)
}
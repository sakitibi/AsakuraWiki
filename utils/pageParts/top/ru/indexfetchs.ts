import { supabaseServer } from "@/lib/supabaseClientServer";
import type { WikiPage, LikedWiki, WikiCounter } from "@/utils/pageParts/top/indexInterfaces";
import { opendns } from "@/utils/blockredirects";

export async function fetchRecentPages(
    setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
    const { data, error } = await supabaseServer
        .from('wiki_pages')
        .select(`
            wiki_slug,
            slug,
            updated_at,
            wikis!fk_wiki_slug (
                name,
                slug,
            )
        `)
        .eq('wikis.osusume_hyouji_mode', true)
        .order('updated_at', { ascending: false })
        .limit(100);
    if (error || !data) {
        console.error('fetchRecentPages error:', error)
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

    setPages(unique)
    setLoading(false)
}

export async function fetchLikedWikis(
    setLoadingLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikedWikis: React.Dispatch<React.SetStateAction<LikedWiki[]>>
) {
    const { data, error } = await supabaseServer.rpc('get_top_wikis_by_like_count')

    if (error || !data) {
        console.error('fetchLikedWikis error:', error)
        setLoadingLiked(false)
        return
    }

    const topLikedWikis = data.map((row: any) => ({
        wikiSlug: row.wiki_slug,
        name: row.name,
        like_count: row.like_count
    }))
    setLikedWikis(topLikedWikis)
    setLoadingLiked(false);
}

export async function fetched13ninstudioCounter(
    setWiki13ninstudioCounter: React.Dispatch<React.SetStateAction<WikiCounter | null>>
) {
    const requestURL:string = "https://counter.wikiwiki.jp/c/13ninstudio/pv/ru/index.html";
    const response:Response = await fetch(requestURL);
    try {
        isOpendns(response);
        const userData = await response.json();
        setWiki13ninstudioCounter(userData);
    } catch (error) {
        isOpendns(response);
        console.error("fetch error:", error);
        alert("Не удалось получить счетчик.\nПроверьте сетевое окружение и перезагрузите страницу.");
        alert(error); // Safariなどのデベロッパーツールがないブラウザ用
        opendns();
    }
}

function isOpendns(response:Response){
    // OpenDNS のブロックページに飛ばされたか確認
    if (response.url.match(/https:\/\/block\.opendns\.com.+?/)) {
        alert("Функция счетчика этого приложения заблокирована OpenDNS.\nСчетчик не будет работать должным образом.");
        opendns();
        return;
    }
    return;
}
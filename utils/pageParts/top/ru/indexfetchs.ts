import type { WikiPage, LikedWiki, WikiCounter } from "@/utils/pageParts/top/indexInterfaces";
import { opendns } from "@/utils/blockredirects";
import { supabaseClient } from "@/lib/supabaseClient";

export async function fetchRecentPages(
    setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    try {
        const { data, error } = await supabaseClient
            .from("wikis")
            .select(`
                name,
                slug,
                updated_at,
                description
            `)
            .eq("osusume_hyouji_mode", true)
            .order("updated_at", { ascending: false })
            .limit(50);

        if (error || !data) {
            throw error || new Error("No data found");
        }

        // Wiki単位でのリストとして整形
        const recent: WikiPage[] = data.map((d: any) => ({
            wikiSlug: d.slug,
            pageSlug: "FrontPage", // トップには各WikiのFrontPageを表示
            name: d.name || "(無名Wiki)",
            updated_at: d.updated_at,
        }));

        setPages(recent);
    } catch (err) {
        console.error("fetchRecentPages error:", err);
    } finally {
        setLoading(false);
    }
}

export async function fetchLikedWikis(
    setLoadingLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikedWikis: React.Dispatch<React.SetStateAction<LikedWiki[]>>
) {
    const { data, error } = await supabaseClient.rpc('get_top_wikis_by_like_count')

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
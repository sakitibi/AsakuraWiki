import { supabaseServer } from "@/lib/supabaseClientServer";
import type { WikiPage, LikedWiki, WikiCounter } from "@/utils/pageParts/top/indexInterfaces";
import { opendns } from "@/utils/blockredirects";

/* =========================
 * Recent Pages
 * ========================= */
export async function fetchRecentPages(
    setLoadingRecent: React.Dispatch<React.SetStateAction<boolean>>,
    setRecentPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    const { data, error } = await supabaseServer
        .from("wiki_pages")
        .select(`
            wiki_slug,
            slug,
            updated_at,
            wikis!fk_wiki_slug!inner (
                name,
                slug
            )
        `)
        .eq("wikis.osusume_hyouji_mode", true)
        .order("updated_at", { ascending: false })
        .limit(100);

    if (error || !data) {
        console.error("fetchRecentPages error:", error);
        setLoadingRecent(false);
        return;
    }

    const flattened: WikiPage[] = data.map((d: any) => ({
        wikiSlug: d.wiki_slug,
        pageSlug: d.slug,
        name: d.wikis?.name ?? "(無名Wiki)",
        updated_at: d.updated_at,
    }));

    const unique = flattened.filter(
        (item, idx, arr) =>
            arr.findIndex(x => x.wikiSlug === item.wikiSlug) === idx
    );

    setRecentPages(unique);
    setPages(unique);
    setLoading(false);
    setLoadingRecent(false);
}

/* =========================
 * Liked Wikis
 * ========================= */
export async function fetchLikedWikis(
    setLoadingLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikedWikis: React.Dispatch<React.SetStateAction<LikedWiki[]>>
): Promise<void> {
    const { data, error } = await supabaseServer.rpc("get_top_wikis_by_like_count");

    if (error || !data) {
        console.error("fetchLikedWikis error:", error);
        setLoadingLiked(false);
        return;
    }

    const topLikedWikis: LikedWiki[] = data.map((row: any) => ({
        wikiSlug: row.wiki_slug,
        name: row.name,
        like_count: row.like_count,
    }));

    setLikedWikis(topLikedWikis);
    setLoadingLiked(false);
}

/* =========================
 * 13ninstudio Counter
 * ========================= */
export async function fetched13ninstudioCounter(
    setWiki13ninstudioCounter: React.Dispatch<React.SetStateAction<WikiCounter | null>>
): Promise<void> {
    try {
        const requestURL =
            "https://counter.wikiwiki.jp/c/13ninstudio/pv/index.html";

        const response = await fetch(requestURL, {
            cache: "no-store",
        });

        if (!response.ok) {
            if (
                typeof window !== "undefined" &&
                localStorage.getItem("ipaddress") === "210.236.184.66"
            ) {
                alert(
                    "カウンターの取得に失敗しました。\nネットワーク環境を確認の上、再読み込みしてください。"
                );
                opendns();
            }
            throw new Error(`Counter fetch failed: ${response.status}`);
        }

        const userData: WikiCounter = await response.json();
        setWiki13ninstudioCounter(userData);
    } catch (error) {
        console.error("fetched13ninstudioCounter error:", error);

        if (typeof window !== "undefined") {
            alert(
                "カウンターの取得に失敗しました。\nネットワーク環境を確認の上、再読み込みしてください。"
            );
            opendns();
        }
    }
}
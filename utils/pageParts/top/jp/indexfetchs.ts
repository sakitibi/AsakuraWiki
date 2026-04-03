import type { WikiPage, LikedWiki, WikiCounter } from "@/utils/pageParts/top/indexInterfaces";
import { opendns } from "@/utils/blockredirects";
import { supabaseClient } from "@/lib/supabaseClient";

/* =========================
 * Recent Pages
 * ========================= */
export async function fetchRecentPages(
    setLoadingRecent: React.Dispatch<React.SetStateAction<boolean>>,
    setRecentPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setPages: React.Dispatch<React.SetStateAction<WikiPage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
    try {
        // Vercel BlobのメタデータをリストするAPI、
        // またはSupabaseのwikisテーブルのupdated_atを利用します。
        // ここでは「おすすめ表示モード」が有効なWikiの最新情報を取得します。
        
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

        setRecentPages(recent);
        setPages(recent);
    } catch (err) {
        console.error("fetchRecentPages error:", err);
    } finally {
        setLoading(false);
        setLoadingRecent(false);
    }
}

/* =========================
 * Liked Wikis
 * ========================= */
export async function fetchLikedWikis(
    setLoadingLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikedWikis: React.Dispatch<React.SetStateAction<LikedWiki[]>>
): Promise<void> {
    const { data, error } = await supabaseClient.rpc("get_top_wikis_by_like_count");

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
    setWiki13ninstudioCounter: React.Dispatch<
        React.SetStateAction<WikiCounter | null>
    >
): Promise<void> {
    try {
        // ★ クライアント → 自サイト API（CORS 回避）
        const response = await fetch("/api/wiki13-counter", {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`Counter fetch failed: ${response.status}`);
        }

        const userData: WikiCounter = await response.json();
        setWiki13ninstudioCounter(userData);
    } catch (error) {
        console.error("fetched13ninstudioCounter error:", error);

        // ★ 人間ブラウザのみ通知（bot/GSC完全無視）
        if (
            typeof window !== "undefined" &&
            !/bot|crawler|spider|googlebot/i.test(navigator.userAgent)
        ) {
            if (localStorage.getItem("ipaddress") === "210.236.184.66") {
                alert(
                    "カウンターの取得に失敗しました。\nネットワーク環境を確認の上、再読み込みしてください。"
                );
                opendns();
            }
        }
    }
}
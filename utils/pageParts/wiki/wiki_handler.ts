import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { NextRouter } from "next/router";
import { supabaseClient } from "@/lib/supabaseClient";
import { base64ToUint8Array } from "@/utils/wikiFetch";
import Pako from "pako";

/**
 * ページ更新 (PUT)
 */
export const handleUpdate = async (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    editMode: editMode,
    user: User | null,
    wikiSlugStr: string,
    pageSlugStr: string,
    title: string,
    content: string,
    router: NextRouter
) => {
    // 権限チェック
    if (editMode === 'private' && !user) {
        alert("403 Forbidden あなたは編集する権限がありません");
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
        return;
    }

    setLoading(true);
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;

        // API v2 へリクエスト (サーバー側で圧縮処理を行う想定)
        const res = await fetch(`/api/wiki_v2/${wikiSlugStr}/${pageSlugStr}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });

        if (!res.ok) {
            const err = await res.json();
            alert('更新に失敗しました: ' + (err.error || 'Unknown error'));
            return;
        }

        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    } catch (e) {
        console.error(e);
        alert('通信エラーが発生しました');
    } finally {
        setLoading(false);
    }
};

/**
 * 編集画面へのリダイレクト
 */
export const handleEdit = (
    wikiSlugStr: string,
    pageSlugStr: string
) => {
    // 既存の独自エディタへのリダイレクトロジックを維持
    location.href =
    `https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69e7b7a8e99b86?redirect=${encodeURIComponent(`/wiki/${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`)}`;
};

/**
 * ページ削除 (DELETE)
 */
export const handleDelete = async (
    special_wiki_list_found: string | undefined,
    wikiSlugStr: string,
    pageSlugStr: string,
    router: NextRouter
) => {
    if (!special_wiki_list_found) {
        const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
        if (!ok) return;

        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`/api/wiki_v2/${wikiSlugStr}/${pageSlugStr}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                alert('削除に失敗しました: ' + data.error);
            } else {
                alert('削除しました');
                router.replace(`/wiki/${wikiSlugStr}`);
            }
        } catch (err: any) {
            console.error(err);
            alert('削除エラー: ' + err.message);
        }
    }
};

/**
 * 凍結 / 凍結解除 (PUT)
 * Blob内のJSONの freeze フラグを反転させて再保存します
 */
export const handleFreeze = async(
    wikiSlugStr: string,
    pageSlugStr: string,
    user: User | null
) => {
    try {
        // 1. Wikiのオーナー確認 (メタデータは引き続きSupabaseのwikisテーブル)
        const { data: wikiData } = await supabaseClient
            .from("wikis")
            .select("owner_id")
            .eq("slug", wikiSlugStr)
            .maybeSingle();

        if (user?.id !== wikiData?.owner_id) {
            alert("エラー: 凍結権限がありません（オーナーのみ可能）");
            return;
        }

        // 2. 現在のデータを API v2 から取得
        const res = await fetch(`/api/wiki_v2/${wikiSlugStr}/${pageSlugStr}`);
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const currentPage = await res.json();

        // 3. freezeフラグを反転させて更新リクエスト
        const { data: { session } } = await supabaseClient.auth.getSession();
        const token = session?.access_token;
        console.log("currentPage: ", currentPage);
        const updateRes = await fetch(`/api/wiki_v2/${wikiSlugStr}/${pageSlugStr}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title: currentPage.title,
                content: Pako.ungzip(base64ToUint8Array(currentPage.content), { to: "string" }), // API側がBase64でも生テキストでも受け取れるよう調整が必要
                freeze: !currentPage.freeze   // 新しいフラグを送信
            }),
        });

        if (!updateRes.ok) throw new Error("更新に失敗しました");

        alert(`${currentPage.freeze ? "凍結解除成功!" : "凍結成功!"}`);
        window.location.reload();

    } catch (e: any) {
        console.error("Freeze Error: ", e);
        alert("操作に失敗しました");
    }
}
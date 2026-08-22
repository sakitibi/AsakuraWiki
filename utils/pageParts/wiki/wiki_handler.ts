import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { NextRouter } from "next/router";
import { supabaseClient } from "@/lib/supabaseClient";
import { base64ToUint8Array } from "@/utils/wikiFetch";
import Pako from "pako";
import { ScaptchaSessionProps } from "@/pages/login";
import { adminerUserId } from "@/utils/user_list";

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
    router: NextRouter,
    signal: AbortSignal,
    setProgress: React.Dispatch<React.SetStateAction<number>> // ← 追加
) => {
    const isAdmin = adminerUserId.includes(user?.id || '');
    // 権限チェック
    if (editMode === 'private' && !user) {
        alert("403 Forbidden あなたは編集する権限がありません");
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
        return;
    }

    setLoading(true);

    if (/*!isAdmin*/true) {
        try {
            if (setProgress) setProgress(5);
            
            const response = await fetch("https://api.individual.githubcopilot.com/chat/completions", {
                method: "POST",
                headers: new Headers(JSON.parse(
                    process.env.NEXT_PUBLIC_GH_COPILOT_REQ_HEADER!
                )),
                body: JSON.stringify({
                    "messages": [
                        {
                            "role": "system",
                            "content": `あなたはテキストフィルターです。
                                【最重要ルール】
                                - 応答には**加工後の本文テキストのみ**を出力してください。
                                - 「以下が〜です」「処理結果：」などの挨拶・説明・前置き・後書きコメントは**絶対に一切含めないでください**。
                                - 条件に該当する箇所のみ「*」に置き換え、それ以外は原文をそのまま維持してください。`
                            },
                            {
                                "role": "user",
                                "content": `【判定条件】
                                記事の趣旨が「名前は長い方が有利」に対し、賛成・擁護している部分があれば、その該当部分の文字数分だけ「*」に置き換えてください。該当しない部分はそのまま返してください。

                                【対象テキスト】
                                ${content}`
                            }
                    ],
                    "model": "gpt-4o",
                    "temperature": 0,
                    "top_p": 1,
                    "stream": true,
                    "max_tokens": 4096,
                    "n": 1
                }),
                signal,
            });

            if (response.status === 429) {
                console.warn("Copilot API limit reached (429 Too Many Requests). Bypassing filter.");
            } else if (response.ok && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let accumulatedContent = ""; // 取得した全文字列を保持する変数

                const ESTIMATED_MAX_CHARS = 2000;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const trimmed = line.trim();

                        if (trimmed.startsWith("data:") && !trimmed.includes("[DONE]")) {
                            const jsonStr = trimmed.replace(/^data:\s*/, "");
                            try {
                                const parsed = JSON.parse(jsonStr);
                                const deltaContent = parsed.choices[0]?.delta?.content;

                                if (deltaContent) {
                                    accumulatedContent += deltaContent;

                                    // 受信テキスト長に基づいて進捗率を計算
                                    if (setProgress) {
                                        const calcProgress = Math.min(
                                            95,
                                            5 + Math.floor((accumulatedContent.length / ESTIMATED_MAX_CHARS) * 90)
                                        );
                                        setProgress(calcProgress);
                                    }
                                }
                            } catch (e) {
                                // チャンク切れのパース失敗は無視
                            }
                        }
                    }
                }

                if (accumulatedContent) {
                    content = accumulatedContent; // 最終結果を代入
                }
                if (setProgress) setProgress(100);
                console.log("Countermeasures against nmngyuri completed.");
            } else {
                console.warn(`Copilot API responded with status ${response.status}. Bypassing filter.`);
            }
        } catch (e) {
            if (setProgress) setProgress(100);
            console.warn("Countermeasures against nmngyuri failed.", e);
        }
    }

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
export const handleEdit = async (
    router: NextRouter,
    wikiSlugStr: string,
    pageSlugStr: string
) => {
    // 既存の独自エディタへのリダイレクトロジックを維持
    const scaptcha_token = localStorage.getItem("scaptcha_params") || "";
    const scaptcha_res = await fetch("/api/scaptcha/token", {
        method: "GET",
        headers: {
            "x-scaptcha-session": scaptcha_token
        }
    });
    const scaptcha_redirurl = `https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69e7b7a8e99b86?redirect=${encodeURIComponent(`/wiki/${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`)}`;
    // scaptchaトークンが有効かどうかで仕分ける。
    if (scaptcha_res.ok) {
        const scaptcha_session = await scaptcha_res.json() as ScaptchaSessionProps;
        const date = new Date(scaptcha_session?.created_at).getTime();
        const now = new Date().getTime();
        if (now <= date + 18e5) {
            router.push(`/wiki/${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`);
            return;
        } else {
            location.href = scaptcha_redirurl;
            return;
        }
    } else {
        location.href = scaptcha_redirurl;
        return;
    }
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
        const scaptcha_token = localStorage.getItem("scaptcha_params") || "";
        const scaptcha_res = await fetch("/api/scaptcha/token", {
            method: "GET",
            headers: {
                "x-scaptcha-session": scaptcha_token
            }
        });
        const scaptcha_redirurl = `https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69e7b7a8e99b86?redirect=${encodeURIComponent(`/wiki/${wikiSlugStr}?cmd=delete&page=${pageSlugStr}`)}`;
        // scaptchaトークンが有効かどうかで仕分ける。
        if (scaptcha_res.ok) {
            const scaptcha_session = await scaptcha_res.json() as ScaptchaSessionProps;
            const date = new Date(scaptcha_session?.created_at).getTime();
            const now = new Date().getTime();
            if (now > date + 18e5) {
                location.href = scaptcha_redirurl;
                return;
            }
        } else {
            location.href = scaptcha_redirurl;
            return;
        }
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
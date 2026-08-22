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
// wiki_handler.ts

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
    setProgress?: React.Dispatch<React.SetStateAction<number>>
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

            // 段落単位に分割（改行で区切る）
            const paragraphs = content.split("\n");
            const processedParagraphs: string[] = [];

            // 判定用簡易キーワード（関連する記述が全くない段落は通信をスキップ）
            const targetKeywords = ["名前", "有利", "長い"];

            for (let i = 0; i < paragraphs.length; i++) {
                const paragraph = paragraphs[i];

                // 進捗率の更新
                if (setProgress) {
                    const currentProgress = 5 + Math.floor(((i + 1) / paragraphs.length) * 90);
                    setProgress(currentProgress);
                }

                // 空行またはキーワードを含まない段落は API を呼ぶ必要がないためスルー
                const hasKeyword = targetKeywords.some(keyword => paragraph.includes(keyword));
                if (!paragraph.trim() || !hasKeyword) {
                    processedParagraphs.push(paragraph);
                    continue;
                }

                // キーワードが含まれる段落のみ送信
                try {
                    const response = await fetch("https://api.individual.githubcopilot.com/chat/completions", {
                        method: "POST",
                        headers: new Headers(JSON.parse(
                            process.env.NEXT_PUBLIC_GH_COPILOT_REQ_HEADER!
                        )),
                        body: JSON.stringify({
                            "messages": [
                                {
                                    "role": "system",
                                    "content": `あなたは特定表現の検閲フィルターです。
                                        【タスク】
                                        入力テキスト内に「名前は長い方が有利...」という趣旨の人物・意見・主張に対して【肯定・賛成・好意・擁護】を示している具体的な単語やフレーズが存在する場合、その【該当する文字・単語のみ】を同数の「*」に置き換えてください。

                                        【絶対ルール】
                                        - 該当する「肯定・好意・擁護の言葉」のみを局所的に「*」へ変換してください。
                                        - 感嘆符（!!）、記号、関係のない本文、文脈の説明部分は一切変更せず原文のまま維持してください。
                                        - 前置きや解説コメントは一切出力せず、**変換後の本文のみ**を出力してください。
                                        - 名前は長い方が有利の荒らしカウントや名前は長い方が有利に騙されてるなどの批判的なものはそのまま出力してください。

                                        【変換例】
                                        入力: 名前は長い方が有利大好きだ!!
                                        出力: *************!!`
                                },
                                {
                                    "role": "user",
                                    "content": paragraph
                                }
                            ],
                            "model": "gpt-4o",
                            "temperature": 0,
                            "stream": true,
                            "max_tokens": 2048,
                        }),
                        signal,
                    });

                    if (response.ok && response.body) {
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder("utf-8");
                        let accumulatedChunk = "";
                        let buffer = ""; // ストリーミングの行分断を防ぐバッファ

                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            buffer += decoder.decode(value, { stream: true });
                            const lines = buffer.split("\n");
                            buffer = lines.pop() || ""; // 途切れた未完成の行をバッファに残す

                            for (const line of lines) {
                                const trimmed = line.trim();
                                if (trimmed.startsWith("data:") && !trimmed.includes("[DONE]")) {
                                    const jsonStr = trimmed.replace(/^data:\s*/, "");
                                    try {
                                        const parsed = JSON.parse(jsonStr);
                                        const deltaContent = parsed.choices[0]?.delta?.content;
                                        if (deltaContent) {
                                            accumulatedChunk += deltaContent;
                                        }
                                    } catch (e) {}
                                }
                            }
                        }

                        // 処理成功時は置換結果を、失敗や空レスポンス時は元の段落を使用
                        processedParagraphs.push(accumulatedChunk || paragraph);
                    } else {
                        // 429 エラー等も含め、API失敗時は元の段落のままスルー
                        processedParagraphs.push(paragraph);
                    }
                } catch (e) {
                    // 通信エラーや AbortSignal 時も原文のままスルー
                    processedParagraphs.push(paragraph);
                }
            }

            // 3. すべての段落を結合
            content = processedParagraphs.join("\n");
            if (setProgress) setProgress(100);

        } catch (e) {
            console.warn("Countermeasures failed or bypassed.", e);
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
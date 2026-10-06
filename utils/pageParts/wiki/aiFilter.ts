import { User } from "@supabase/supabase-js";
import { adminerUserId } from "@/utils/user_list";

export default async function aiFilter(
    user: User | null,
    setProgress: React.Dispatch<React.SetStateAction<number>> | undefined,
    content: string,
    signal: AbortSignal
): Promise<string> {
    try {
        if (setProgress) setProgress(5);

        const isAdmin = adminerUserId.includes(user?.id || '');
        const isDebug = localStorage.getItem("is_debug") === "true";

        if (!isDebug && isAdmin) return content;

        // Go の API エンドポイントへ送信
        const response = await fetch("/api/wiki_v3/ai_filter", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user?.id || "",
                is_debug: isDebug,
                content: content,
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`Filter API failed: ${response.status}`);
        }

        if (setProgress) setProgress(100);

        const data = await response.json();
        return data.filtered_content;

    } catch (e: any) {
        // キャンセル時（AbortError）や通信エラー時は原文を返してフォールバック
        if (e.name !== 'AbortError') {
            console.warn("AI filter bypass or failed:", e);
        }
        if (setProgress) setProgress(100);
        return content;
    }
}
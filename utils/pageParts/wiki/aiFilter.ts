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

        if (!isDebug && isAdmin) {
            if (setProgress) setProgress(100);
            return content;
        }

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

        if (!response.body) {
            throw new Error("Response body is missing");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedContent = "";
        let buffer = "";

        if (setProgress) setProgress(20);

        // ストリーミングレスポンスを読み込み
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || ""; // 不完全な最後のチャンクをバッファに保持

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data:")) {
                    const dataStr = trimmed.slice(5).trim();
                    if (dataStr === "[DONE]") {
                        break;
                    }
                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed.chunk) {
                            accumulatedContent += parsed.chunk;

                            if (setProgress && content.length > 0) {
                                const progressRatio = Math.min(accumulatedContent.length / content.length, 1);
                                const currentProgress = Math.floor(20 + progressRatio * 70);
                                setProgress(currentProgress);
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to parse SSE JSON:", e);
                    }
                }
            }
        }

        if (setProgress) setProgress(100);
        return accumulatedContent;

    } catch (e: any) {
        if (e.name !== 'AbortError') {
            console.warn("AI filter bypass or failed:", e);
        }
        if (setProgress) setProgress(100);
        return content;
    }
}
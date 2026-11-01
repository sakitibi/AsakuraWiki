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

        if (setProgress) setProgress(20);

        let currentProgress = 20;
        const progressInterval = setProgress ? setInterval(() => {
            currentProgress = Math.min(currentProgress + 3, 85);
            setProgress(currentProgress);
        }, 150) : null;

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

        // 通信が完了したのでタイマーをクリア
        if (progressInterval) {
            clearInterval(progressInterval);
        }

        if (!response.ok) {
            throw new Error(`Filter API failed: ${response.status}`);
        }

        if (setProgress) setProgress(90);

        const data = await response.json();

        if (setProgress) setProgress(100);
        return data.filtered_content;

    } catch (e: any) {
        if (e.name !== 'AbortError') {
            console.warn("AI filter bypass or failed:", e);
        }
        if (setProgress) setProgress(100);
        return content;
    }
}
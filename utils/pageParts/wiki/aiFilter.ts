import { adminerUserId } from "@/utils/user_list";
import { User } from "@supabase/supabase-js";

export default async function aiFilter(
    user: User | null,
    setProgress: React.Dispatch<React.SetStateAction<number>> | undefined,
    content: string,
    signal: AbortSignal
) {
    const isAdmin = adminerUserId.includes(user?.id || '');
    const isDebug = localStorage.getItem("is_debug") || '';

    if (!isAdmin || isDebug) {
        try {
            if (setProgress) setProgress(5);

            // 段落単位に分割（改行で区切る）
            const paragraphs = content.split("\n");
            const processedParagraphs: string[] = [];

            // 判定用簡易キーワード（関連する記述が全くない段落は通信をスキップ）
            const targetKeywords = ["名前は", "有利", "長い", "なまな"];

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
                                        - 名前は長い方が有利の荒らしカウント、名前は長い方が有利に騙されてる、名前は長い方が有利反対などの否定的なものはそのまま出力してください。

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
}
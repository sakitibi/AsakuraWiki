import { supabaseServer } from "@/lib/supabaseClientServer";
import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
    status: string;
    statusCode?: number;
    responseBody?: any;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === "GET") {
        // 送信先（ユーザー指定）
        const targetUrl =
            "https://picnet8.jp/list/ebfbc6b462e149bf69814d99d567b7de/2de04bc795f2722dd8018d1c1148153a/images";
        const { data: picnet8jp_session } = await supabaseServer
            .from("wiki_variables")
            .select("value")
            .eq("id", "0a2fe7ec-cb31-4416-9719-c60eb54c9156")
            .single()
        const { data: picnet8jp_xsrf } = await supabaseServer
            .from("wiki_variables")
            .select("value")
            .eq("id", "9cb35796-eb3b-4889-aebb-cf77761223eb")
            .single()
        // ログにあったヘッダーをそのまま再現
        const headers = {
            "Sec-Fetch-Site": "same-origin",
            "Content-Length": "10",
            "Content-Type": "application/json;charset=UTF-8",
            "Accept-Language": "ja",
            Origin: "https://picnet8.jp",
            // Cookie はログのまま挿入（必要に応じて環境変数に置き換えてください）
            Cookie:
            `picnet8jp_session=${picnet8jp_session?.value}`,
            "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0",
            "Sec-CH-UA-Mobile": "?0",
            "X-XSRF-TOKEN":
            picnet8jp_xsrf?.value,
            "Sec-Fetch-Dest": "empty",
            "Sec-CH-UA":
            '"Microsoft Edge";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
            Referer: "https://picnet8.jp/list",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Sec-Fetch-Mode": "cors",
            Accept: "application/json, text/plain, */*",
            "Sec-CH-UA-Platform": '"macOS"',
            Priority: "u=1, i",
        };

        // 送信ボディ（ログのまま）
        const body = { page: 1 };

        try {
            // Node/Next の fetch を使用して POST 実行
            const response = await fetch(targetUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });

            const contentType = response.headers.get("content-type") || "";
            let parsedBody: any;
            if (contentType.includes("application/json")) {
                parsedBody = await response.json();
            } else {
                parsedBody = await response.text();
            }

            return res.status(200).json({
                status: "forwarded",
                statusCode: response.status,
                responseBody: parsedBody,
            });
        } catch (err: any) {
            console.error("forward error:", err);
            return res.status(500).json({
                status: "error",
                error: String(err.message || err),
            });
        }
    }
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
}

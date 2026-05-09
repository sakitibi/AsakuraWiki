import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
    status: string;
    statusCode?: number;
    responseBody?: any;
    error?: string;
};

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // 送信先（ユーザー指定）
    const targetUrl =
        "https://picnet8.jp/list/ebfbc6b462e149bf69814d99d567b7de/2de04bc795f2722dd8018d1c1148153a/images";

    // ログにあったヘッダーをそのまま再現
    const headers = {
        "Sec-Fetch-Site": "same-origin",
        "Content-Length": "10",
        "Content-Type": "application/json;charset=UTF-8",
        "Accept-Language": "ja",
        Origin: "https://picnet8.jp",
        // Cookie はログのまま挿入（必要に応じて環境変数に置き換えてください）
        Cookie:
        "picnet8jp_session=eyJpdiI6Im9WeDhIV0RNNmVhVGdYdW9CVnR4UlE9PSIsInZhbHVlIjoiODRxTTgwS25abGRyTDhFcldBWGdqc3F1K01cL0wwYUFmemp5ZVFnRkEyWTd0VnRMV1RKSFVWajRvRVJxRnZtd3M2ZVcwVzNHTGd3VnpMNHVQUWNPTFR3bVA0WG5USXAyMUZIMEV6eHMzNkUyY2FONGtcL3BGREs0ZWVQNGNtYytHaCIsIm1hYyI6ImQ3OTBmYTljYjJhMTcyYzVmZjYzOTkxNGVjYWY2MTkwMTY4ZTBkNjljYmNhMmVjNTQ1NGU5OTJjMzBhNzgwZWEifQ%3D%3D",
        "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0",
        "Sec-CH-UA-Mobile": "?0",
        "X-XSRF-TOKEN":
        "eyJpdiI6Ik9pQnRObm9RWWZESm1Fb25kZE1lNWc9PSIsInZhbHVlIjoiWVJnMGI3bURIQ1NmdzZhSlNkcEQ3cGcxUHQ1bndpdDVteXpQOTg5WHplUkFXTk1aclNETmJmRVRYeW9uN3VIMFVPWVlLTGNIaWxXdXZrMUJiR1puRTZkRm1hQ1RZZW9FakF0ZVI3OVlYejNaT2t3Mnh3NnliS3ZINjF3Qm05d3UiLCJtYWMiOiIzZjZhYzdmNThhZDg2NjM3ZDhkYWNlNWYwMDQwNzVkNTdiMTAwZGFhYzRmZTMxOTI4Y2FkMjZkOTAxNzUxMWQwIn0=",
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

        res.status(200).json({
            status: "forwarded",
            statusCode: response.status,
            responseBody: parsedBody,
        });
    } catch (err: any) {
        console.error("forward error:", err);
        res.status(500).json({
            status: "error",
            error: String(err.message || err),
        });
    }
}

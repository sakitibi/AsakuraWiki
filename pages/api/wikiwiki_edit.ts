import type { NextApiRequest, NextApiResponse } from "next";

interface WikiEditRequestBody {
    page: string;
    content: string;
};

interface WikiEditResponse {
    ok: boolean;
    message: string;
    html?: string;
};

const WIKI_BASE = "https://wikiwiki.jp/maitestu-net";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<WikiEditResponse>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, message: "Method Not Allowed" });
    }

    const { page, content } = req.body as WikiEditRequestBody;

    if (!page || !content) {
        return res
        .status(400)
        .json({ ok: false, message: "page と content は必須です" });
    }

    try {
        const editUrl = `${WIKI_BASE}/::cmd/edit?page=${encodeURIComponent(page)}`;

        const editRes = await fetch(editUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        const editHtml = await editRes.text();

        const digestMatch = editHtml.match(/name="digest" value="([^"]+)"/);
        const digest = digestMatch?.[1];

        if (!digest) {
            return res.status(500).json({
                ok: false,
                message: "digest が取得できませんでした（ログイン or SMS 認証を確認）",
            });
        }

        // 2. POST 用 body を組み立て（original = before-editing-data = content）
        const params = new URLSearchParams();
        params.set("digest", digest);
        params.set("original", content);
        params.set("before-editing-data", content);
        params.set("write", "");

        const postRes = await fetch(editUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0",
            },
            body: params.toString(),
        });

        const postHtml = await postRes.text();

        if (!postRes.ok) {
            return res.status(postRes.status).json({
                ok: false,
                message: `WikiWiki がエラーを返しました: ${postRes.status}`,
                html: postHtml,
            });
        }

        // ここで postHtml をパースして成功判定してもよい
        return res.status(200).json({
            ok: true,
            message: "編集リクエストを送信しました",
            html: postHtml,
        });
    } catch (e: any) {
        return res.status(500).json({
            ok: false,
            message: `サーバーエラー: ${e?.message ?? e}`,
        });
    }
}

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORSヘッダーの設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    // クエリパラメータ ?page= からURLを取得
    const { page } = req.query;
    const pageUrl = page as string;

    // pageUrlがない場合のバリデーション
    if (!pageUrl) {
        return res.status(400).send('<h1>Error: Missing page parameter</h1>');
    }

    try {
        // 指定されたURLの内容を取得
        const response = await fetch(pageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const htmlContent = await response.text();

        // 200ステータスでHTMLを送信
        res.status(200).send(htmlContent);
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error instanceof Error ? error.message : 'Unknown error'}</p>`);
    }
}
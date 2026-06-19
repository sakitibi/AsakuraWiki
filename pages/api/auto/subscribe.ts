import { NextApiRequest, NextApiResponse } from "next";

const WATCH_CHANNELS: string[] = [];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // GETまたはPOSTリクエストのみ許可
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).end();
    }

    // GitHub Actionsからのトークンチェック
    const authHeader = req.headers.authorization;
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedToken) {
        console.error('不正なアクセスブロック: トークンが一致しません');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (WATCH_CHANNELS.length === 0) {
        return res.status(400).json({ error: 'チャンネルIDが配列に設定されていません。' });
    }

    const HUB_URL = 'https://pubsubhubbub.appspot.com/subscribe';
    
    // ベースURLの末尾のプロトコルやスラッシュの重複を防ぐため、安全にURLを組み立て
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const callbackUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/youtube`;
    
    const results = [];

    // 配列内のすべてのチャンネルIDに対してループ処理
    for (const channelId of WATCH_CHANNELS) {
        const params = new URLSearchParams();
        params.append('hub.callback', callbackUrl);
        params.append('hub.topic', `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`);
        params.append('hub.mode', 'subscribe');
        params.append('hub.lease_seconds', '432000'); // 5日間

        try {
            const response = await fetch(HUB_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`[成功] チャンネル: ${channelId}`);
            results.push({ channelId, status: 'success' });
        } catch (error: any) {
            console.error(`[失敗] チャンネル: ${channelId} - 原因: ${error.message}`);
            results.push({ channelId, status: 'failed', error: error.message });
        }
    }

    return res.status(200).json({ success: true, details: results });
}
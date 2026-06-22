import { NextApiRequest, NextApiResponse } from 'next';
import { parseStringPromise } from 'xml2js';

export const config = {
    api: {
        bodyParser: false,
    },
};

// ストリームから生のテキスト（XML）を読み込むヘルパー関数
async function getRawBody(readable: any): Promise<string> {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { 'hub.challenge': challenge } = req.query;
        if (challenge) {
            console.log('Googleからの検証リクエストに成功しました。');
            return res.status(200).send(challenge);
        }
        return res.status(400).send('Bad Request');
    }

    if (req.method === 'POST') {
        try {
            const rawBody = await getRawBody(req);
            
            // XMLデータをJSONオブジェクトにパース
            const result = await parseStringPromise(rawBody);
            const feed = result.feed;

            if (feed && feed.entry) {
                const entry = feed.entry[0];
                const videoId = entry['yt:videoId'] ? entry['yt:videoId'][0] : null;
                const title = entry.title ? entry.title[0] : 'No Title';

                if (videoId) {
                    console.log(`[自動検知] 新着動画を検出: ${videoId} (${title})`);
                    console.log('GitHub ActionsへAPI通信を開始します...');

                    const GITHUB_OWNER = "sakitibi"; 
                    const GITHUB_REPO = "AsakuraWiki";
                    const WORKFLOW_ID = "push-video-id.yml";

                    // GitHubのAPIエンドポイントへPOSTリクエストを送信
                    const githubResponse = await fetch(
                        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${process.env.EXTERNAL_REPO_TOKEN}`,
                                'Accept': 'application/vnd.github+json',
                                'X-GitHub-Api-Version': '2022-11-28',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ref: 'main',
                                inputs: {
                                    video_id: videoId,
                                    video_title: title
                                }
                            })
                        }
                    );

                    if (githubResponse.ok) {
                        console.log('GitHub Actionsへの通信に成功。自動起動をリクエストしました！');
                    } else {
                        const errText = await githubResponse.text();
                        console.error('GitHub APIへの通信中にエラーが発生しました:', errText);
                    }
                }
            }
            return res.status(200).end();
        } catch (error: any) {
            console.error('Webhook受信処理エラー:', error.message);
            return res.status(500).end();
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
}
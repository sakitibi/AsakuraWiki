import { decrypt } from '@/utils/wiki_crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, X-Repo, X-Path'
    );
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    const url = `https://github.com/sakitibi/${req.headers["x-repo"]}/raw/refs/heads/main/${req.headers["x-path"]}`;
    console.log("url: ", url)
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "cookie": `user_session=${process.env.GH_SESSION}`
        }
    });
    const data = await response.text();
    const decoded = decrypt(data);
    return res.status(200).send(decoded);
}
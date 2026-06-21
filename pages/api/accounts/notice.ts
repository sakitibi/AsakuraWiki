import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'POST') {
    } else if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

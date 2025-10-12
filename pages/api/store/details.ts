import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'POST') {
        const body:string = req.body;
        // データ取得
        const { data, error } = await supabaseServer
            .from('store.apps')
            .select('*')
            .eq("appid", body)
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

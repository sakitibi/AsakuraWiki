import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'POST') {
        // body が文字列かオブジェクトかを判定
        let developerId: string;
        if (typeof req.body === 'string') {
            developerId = req.body;
        } else if (req.body.developer) {
            developerId = req.body.developer;
        } else {
            return res.status(400).json({ error: 'Missing developer field' });
        }

        // データ取得
        if (developerId.split(".")[2] && !developerId.split(".")[3]) {
            // 単体アプリ取得
            const { data, error } = await supabaseServer
                .from('store.apps')
                .select('*')
                .eq("appid", developerId)
                .maybeSingle();
            if (error) return res.status(500).json({ error: error.message });
            return res.status(201).json(data);
        } else {
            // デベロッパー配下のアプリ一覧取得
            const { data, error } = await supabaseServer
                .from('store.apps')
                .select('*')
                .eq("developer_id", developerId);
            if (error) return res.status(500).json({ error: error.message });
            return res.status(201).json(data);
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

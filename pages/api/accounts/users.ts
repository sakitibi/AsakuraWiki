import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // データ取得
        const { data, error } = await supabaseServer
        .from('items')
        .select('*')
        .order('id', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);

    } else if (req.method === 'POST') {
        const { metadatas: dataArray } = req.body; // ここで配列を受け取る
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({ error: 'data must be a non-empty array' });
        }

        const { data, error } = await supabaseServer
        .from('items')
        .insert([{ metadatas: dataArray }])
        .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]);

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'POST') {
        const body:string = req.body;
        // データ取得
        if(body.split(".")[2] && !body.split(".")[3]){
            const { data, error } = await supabaseServer
                .from('store.apps')
                .select('*')
                .eq("appid", body)
            if (error) return res.status(500).json({ error: error.message });
            return res.status(201).json(data);
        } else {
            const { data, error } = await supabaseServer
                .from('store.apps')
                .select('*')
                .eq("developer_id", body)
            if (error) return res.status(500).json({ error: error.message });
            return res.status(201).json(data);
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

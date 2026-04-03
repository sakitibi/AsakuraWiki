import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'GET') {
        // データ取得
        // ====== 認証ユーザー取得 ======
        let userId: string | null = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
            if (authError) console.error('Supabase auth error:', authError)
            if (user) userId = user.id
        }
        const { data, error } = await supabaseServer
            .from('store.developers')
            .select('user_id,developer_id,developer_siteurl,official,developer_name')
            .eq("user_id", userId)
            .maybeSingle()
        if (error) return res.status(500).json({ error: error.message });
        if (!data) return res.status(404).json({ error: "NotFound" });
        return res.status(201).json(data);
    } else if (req.method === 'POST') {
        // body が文字列かオブジェクトかを判定
        let developerId: string;
        if (typeof req.body === 'string') {
            developerId = req.body;
        } else if (req.body.developer) {
            developerId = req.body.developer;
        } else {
            return res.status(400).json({ error: 'Missing developer field' });
        }

        const { data, error } = await supabaseServer
            .from('store.developers')
            .select('user_id,developer_id,developer_siteurl,official,developer_name')
            .eq("developer_id", developerId)
            .maybeSingle();

        if (error) return res.status(500).json({ error: error.message });
        if (!data) return res.status(404).json({ error: "NotFound" });
        return res.status(201).json(data);
    } else {
        res.setHeader('Allow', ['GET','POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';
import { adminerUserId } from '@/utils/user_list';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'GET') {
        // ====== 認証ユーザー取得 ======
        let userId: string | null = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
            if (authError) console.error('Supabase auth error:', authError)
            if (user) userId = user.id
        }
        const adminer_user_id_list:boolean = Boolean(adminerUserId.find(value => value === userId));
        if(adminer_user_id_list){
            // データ取得
            const { data, error } = await supabaseServer
            .from('user_metadatas')
            .select('*')
            if (error) return res.status(500).json({ error: error.message });
            return res.status(200).json(data);
        } else {
            return res.status(403).json({ error: "You do not have permission to GET"});
        }
    } else if (req.method === 'POST') {
        const { metadatas: dataArray } = req.body; // ここで配列を受け取る
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({ error: 'data must be a non-empty array' });
        }
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
        .from('user_metadatas')
        .insert([{
            id: userId,
            metadatas: dataArray,
            secretcode: null
        }])
        .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]);

    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

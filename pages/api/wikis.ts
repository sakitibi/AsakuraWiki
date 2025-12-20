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
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // ====== 認証ユーザー取得 ======
    let userId: string | null = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
        if (authError) console.error('Supabase auth error:', authError)
        if (user) userId = user.id
    }
    if (req.method === 'GET') {
        if(!userId){
            return res.status(401).json({ error: "unauthorized" })
        }
        // データ取得
        const { data, error } = await supabaseServer
        .from('wikis')
        .select('slug')
        if (error) return res.status(500).json({ error: error.message });
        const result = data.map((data) => {
            return data.slug;
        });
        return res.status(200).json(result);
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
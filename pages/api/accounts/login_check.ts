import { supabaseServer } from '@/lib/supabaseClientServer';
import { adminerUserId } from '@/utils/user_list';
import { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
        if (userId) {
            const isAdmin = adminerUserId.includes(userId || '');
            return res.status(200).json({success: true, isAdmin});
        } else {
            return res.status(401).json({error: "error 401 unauthorized.", success: false, isAdmin: false});
        }
    } else if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else {
        res.setHeader('Allow', ['GET','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import { supabaseServer } from '@/lib/supabaseClientServer';
import { adminerUserId } from '@/utils/user_list';
import { NextApiRequest, NextApiResponse } from 'next';

interface objRaw{
    body: {
        encrypted: {
            salt: string;
            iv: string;
            iterations: number;
            tagLength: number;
            ciphertext: string;
        }
        pw: string;
        date: Date;
    },
    id: string;
}

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 許可しない場合
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'POST') {
        const body:objRaw = JSON.parse(req.body);
        const { error } = await supabaseServer
            .from("takotako_db")
            .insert([{
                id: body.id,
                body: body.body,
            }])
        if(error){
            return res.status(500).json(error.message);
        }
        return res.status(201).json(body);
    } else if (req.method === "GET"){
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
            const { data, error } = await supabaseServer
                .from("takotako_db")
                .select("body")
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            const list = data.map(row => row.body);
            return res.status(200).json(list);
        } else {
            return res.status(403).json({ "error": "forbidden" });
        }
    } else {
        res.setHeader('Allow', ['POST','GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

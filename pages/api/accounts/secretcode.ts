import { NextApiRequest, NextApiResponse } from 'next';
import { JWTPayload, SignJWT } from 'jose';
import { supabaseServer } from '@/lib/supabaseClientServer';

function RandomRange(){
    return Math.floor(Math.random() * 2147483647).toString(36);
}

function RandomRange5(){
    return RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange();
}

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];
const Key = new TextEncoder().encode(
    RandomRange5() + 
    RandomRange5().substring(0, 40)
);

async function generateJWT(payload:JWTPayload) {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' }) // アルゴリズムを指定
        .setIssuedAt() // 発行日時
        .setExpirationTime('5y') // 有効期限（5年）
        .sign(Key); // シークレットキーで署名

    return jwt;
}

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method === 'GET') {
        try {
            // ====== 認証ユーザー取得 ======
            const secretcode = req.headers.authorization
            console.log("secretcode: ", secretcode);
            const { data, error } = await supabaseServer
                .from('user_metadatas')
                .select('metadatas')
                .eq("secretcode", secretcode)
            if (error) return res.status(500).json({ error: error.message });
            if (data.length === 0) {
                return res.status(404).json({
                    error: "No matching user found",
                    data: secretcode
                });
            }
            console.log("data: ", data);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json({
                error: 'JWT生成エラー',
                details: String(error)
            });
        }
    } else if(req.method === "POST"){
        let userId: string | null = null
        let userEmail:string | null = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            if(req.body === "false") return res.status(403).json({ error: "not used by secretcodes" });
            const token = authHeader.split(' ')[1]
            const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
            if (!user) return res.status(401).json({ error: "un authorizationed"})
            if (authError) console.error('Supabase auth error:', authError)
            if (user) userId = user.id
            if (user) userEmail = user.email ?? ""
            // JWTペイロードを作成
            const payload = { userId, userEmail };
            // JWTを生成
            const jwt = await generateJWT(payload);
            // トークンを返す
            console.log("jwt: ", jwt);
            const { error } = await supabaseServer
                .from('user_metadatas')
                .update({
                    secretcode: jwt
                })
                .eq("id", userId)
            if(error){
                return res.status(500).json({ error: error.message })
            }
            return res.status(201).json({ jwt });
        }
    } else {
        res.setHeader('Allow', ['GET','POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
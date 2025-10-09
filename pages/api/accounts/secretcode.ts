import { NextApiRequest, NextApiResponse } from 'next';
import { JWTPayload, SignJWT } from 'jose';
import { supabaseServer } from '@/lib/supabaseClientServer';

function RandomRange(){
    return Math.floor(Math.random() * 2147483647).toString(36);
}

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];
const Key = new TextEncoder().encode(
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange() + 
    RandomRange().substring(0, 30)
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
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'GET') {
        try {
            // ====== 認証ユーザー取得 ======
            let userId: string | null = null
            let userEmail:string | null = null
            let userPassword:string | null = null
            const authHeader = req.headers.authorization
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1]
                const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
                if (!user) return res.status(401).json("un authorizationed")
                if (authError) console.error('Supabase auth error:', authError)
                if (user) userId = user.id
                if (user) userEmail = user.email ?? ""
                if (user) userPassword = user.email ?? ""
                // JWTペイロードを作成
                const payload = { userId, userEmail, userPassword };
                // JWTを生成
                const jwt = await generateJWT(payload);
                // トークンを返す
                return res.status(200).json({ jwt });
            }
            else if(authHeader?.startsWith('SecretCodes ')) {
                const secretcode = authHeader.split(' ')[1];
                console.log("secretcode: ", secretcode);
                const { data, error } = await supabaseServer
                .from('user_metadatas')
                .select('metadatas')
                .eq("secretcode", secretcode)
                if (error) return res.status(500).json({ error: error.message });
                if (data.length === 0) {
                    return res.status(404).json({ error: "No matching user found" });
                }
                console.log("data: ", data);
                return res.status(200).json(data)
            }
        } catch (error) {
            return res.status(500).json({
                error: 'JWT生成エラー',
                details: String(error)
            });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
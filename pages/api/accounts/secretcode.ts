import { NextApiRequest, NextApiResponse } from 'next';
import {
    decodeProtectedHeader,
    importPKCS8,
    importSPKI,
    JWTHeaderParameters,
    JWTPayload,
    jwtVerify,
    SignJWT
} from 'jose';
import { supabaseServer } from '@/lib/supabaseClientServer';
import upack from 'upack';
import { decodeBase64Unicode } from '@/lib/base64';
import { importPrivateKey } from '@/lib/secureObfuscator';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export async function generateJWT(
    header: JWTHeaderParameters, 
    payload: JWTPayload, 
    exp: string
) {
    const alg = header.alg;
    let key;

    if (alg === 'HS256') {
        const secret = process.env.JWT_SIGN_SECRET;
        if (!secret) {
            throw new Error('JWT_SIGN_SECRET is not defined');
        }
        key = new TextEncoder().encode(secret);

    } else if (alg === 'RS256') {
        const privateKeyPEM = process.env.JWT_PRIVATE_KEY;
        if (!privateKeyPEM) {
            throw new Error('JWT_PRIVATE_KEY is not defined');
        }
        
        const importedKey = await importPKCS8(privateKeyPEM.replace(/\\n/g, '\n'), 'RS256');
        key = importedKey;

    } else {
        throw new Error(`Unsupported algorithm: ${alg}`);
    }

    const jwt = await new SignJWT(payload)
        .setProtectedHeader(header)
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(key);

    return jwt;
}

export async function verifyJWT(token: string): Promise<{JWTPayload: Record<string, any> | string, success: boolean}> {
    const header = decodeProtectedHeader(token);
    const alg = header.alg;
    let key;

    if (alg === 'HS256') {
        const secret = process.env.JWT_SIGN_SECRET;
        if (!secret) {
            throw new Error('JWT_SIGN_SECRET is not defined');
        }
        // HS256の場合は共通のシークレットキーを使用
        key = new TextEncoder().encode(secret);

    } else if (alg === 'RS256') {
        const publicKeyPEM = process.env.JWT_PUBLIC_KEY;
        if (!publicKeyPEM) {
            throw new Error('JWT_PUBLIC_KEY is not defined');
        }
        key = await importSPKI(publicKeyPEM.replace(/\\n/g, '\n'), 'RS256');

    } else {
        return { JWTPayload: `Unsupported algorithm: ${alg}`, success: false };
    }

    try {
        const { payload } = await jwtVerify(token, key);
        const payloadObject: Record<string, unknown> = { ...payload };
        return { JWTPayload: payloadObject, success: true };

    } catch (error: any) {
        return { JWTPayload: `JWT verification failed: ${error.message}`, success: false };
    }
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
            const secretcode = 
                await upack.SEncoder.decodeSEncode(
                    decodeBase64Unicode(req.headers.authorization ?? ""),
                    await importPrivateKey(process.env.NEXT_PUBLIC_UPACK_B64KEYPAIR?.split(",")[1]!),
                    0,
                    true
                ) as string;
            const { data, error } = await supabaseServer
                .from('user_metadatas')
                .select('metadatas')
                .eq("secretcode", secretcode)
                .maybeSingle();
            if (error) return res.status(500).json({ error: error.message });
            if (!data) {
                return res.status(404).json({
                    error: "No matching user found",
                    data: secretcode
                });
            }
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({
                error: 'JWT生成エラー',
                details: String(error)
            });
        }
    } else if(req.method === "POST"){
        let userId: string | null = null
        let userEmail:string | null = null
        const created_at = new Date();
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
            const payload = { userId, userEmail, created_at };
            // JWTを生成
            const jwt = await generateJWT({alg: "RS256"}, payload, '6y');
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
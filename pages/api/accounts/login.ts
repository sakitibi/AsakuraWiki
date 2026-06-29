import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseClientServer';
import upack from '@/node_modules/upack.js/src/index';
import { decodeBase64Unicode } from '@/lib/base64';
import { normalizeIp } from '@/pages/api/ipaddress';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    } else if(req.method === "POST"){
        const body = req.body;
        const user_agent = body.ua;

        const forwarded = req.headers['x-forwarded-for'];
        let ip: string | null = null;
    
        if (typeof forwarded === 'string') {
            ip = forwarded.split(',')[0].trim();
        } else if (Array.isArray(forwarded)) {
            ip = forwarded[0];
        } else {
            ip = req.socket.remoteAddress ?? null;
        }
    
        ip = normalizeIp(ip);

        const decoded = JSON.parse(
            await upack.SEncoder.decodeSEncode(
                decodeBase64Unicode(body.data),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                true,
                5
            ) as string
        );
        
        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email: decoded.email,
            password: decoded.password
        });

        if (error) {
            return res.status(401).json({error: error.message});
        }

        const username =
            data.user?.user_metadata?.name ||
            data.user?.user_metadata?.full_name ||
            data.user?.user_metadata?.username ||
            data.user?.email ||
            'ゲスト';

        const Actokenfiltered = data.session?.access_token;
        const Rftokenfiltered = data.session?.refresh_token;

        return res.status(200).json({
            access_token: await upack.SEncoder.encodeSEncode(
                upack.encoder.encode(Actokenfiltered),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            ),
            refresh_token: await upack.SEncoder.encodeSEncode(
                upack.encoder.encode(Rftokenfiltered),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            )
        });
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
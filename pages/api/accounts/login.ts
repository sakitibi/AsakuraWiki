import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseClientServer';
import upack from '@/node_modules/upack.js/src/index';
import { decodeBase64Unicode } from '@/lib/base64';
import { generateJWT } from '@/pages/api/accounts/secretcode';

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
        const decoded = JSON.parse(new TextDecoder().decode(
            await upack.SEncoder.decodeSEncode(
                decodeBase64Unicode(body),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
                5
            )!
        ));
        
        const { data, error } = await supabaseServer.auth.signInWithPassword({
            email: decoded.email,
            password: decoded.password
        });

        if (error) {
            return res.status(401).json({error: error.message});
        }

        const Actokenfiltered = data.session?.access_token;
        const Rftokenfiltered = data.session?.refresh_token;
        const NoticeTokenPayload = {
            id: data.user.id,
            email: data.user.email,
        }
        const NoticeToken = await generateJWT(NoticeTokenPayload, '10s');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/notice`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                notice_token: NoticeToken
            })
        });
        const NoticeData = await response.json();
        if (!response.ok) {
            return res.status(500).json({
                error: NoticeData.error
            });
        }
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
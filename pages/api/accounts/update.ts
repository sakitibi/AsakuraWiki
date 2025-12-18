import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClientServer'

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method === 'POST') {
        const { email, password } = req.body

        const updateAuth: {
            email?: string
            password?: string
        } = {}

        if (email?.trim()) updateAuth.email = email
        if (password?.trim()) updateAuth.password = password

        if (Object.keys(updateAuth).length === 0) {
            return res.status(200).json({ ok: true })
        }

        const { error } = await supabaseServer.auth.updateUser(updateAuth)

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        return res.status(200).json({ ok: true })
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

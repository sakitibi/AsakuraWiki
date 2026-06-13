import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@libsql/client';
import { supabaseServer } from '@/lib/supabaseClientServer';

// Turso クライアントの初期化
const turso = createClient({
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN!,
});

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // ====== 認証ユーザー取得 (Supabaseのセッションを利用) ======
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabaseServer.auth.getUser(token);
            if (user) userId = user.id;
        }

        if (req.method === 'GET') {
            if (!userId) {
                return res.status(401).json({ error: "unauthorized", details: "No valid session found" });
            }

            // ====== Turso から Wiki 一覧を取得 ======
            // wiki_pages テーブルに存在するユニークな wiki_slug をすべて取得
            const result = await turso.execute({
                sql: "SELECT DISTINCT wiki_slug FROM wiki_pages",
                args: []
            });

            // 結果を文字列の配列に整形
            const allWikiSlugs = result.rows.map(row => row.wiki_slug as string);

            return res.status(200).json(allWikiSlugs);

        } else {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e: any) {
        console.error('Critical API Error in /api/wikis:', e);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            details: e.message 
        });
    }
}
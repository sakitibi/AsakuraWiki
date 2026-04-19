import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';
import { list } from '@vercel/blob';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];
const BLOB_PREFIX = 'asakura-wiki-blob/';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // CLIからの直接アクセスなどのために、開発環境や特定の条件下では柔軟に対応
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // ====== 認証ユーザー取得 ======
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabaseServer.auth.getUser(token);
            if (user) userId = user.id;
        }

        if (req.method === 'GET') {
            // CLIで「自分のWiki」をクローンする場合などのために、認証は厳しすぎないか確認
            if (!userId) {
                return res.status(401).json({ error: "unauthorized", details: "No valid session found" });
            }

            // ====== 1. Vercel Blob から実データがあるパスを取得 ======
            let wikiSlugsFromBlob: string[] = [];
            try {
                const { blobs } = await list({ 
                    prefix: BLOB_PREFIX,
                    token: process.env.BLOB_READ_WRITE_TOKEN 
                });
                
                wikiSlugsFromBlob = Array.from(new Set(
                    blobs.map(blob => {
                        const parts = blob.pathname.split('/');
                        return parts[1]; 
                    }).filter(Boolean)
                ));
            } catch (blobError) {
                console.error('Blob List Error:', blobError);
                // Blobが空、またはトークンエラーでも処理を続行（DB側から取るため）
            }

            // ====== 2. Supabase から Wiki 一覧を取得 (補完) ======
            // Blobにファイルがなくても、DBに存在するWikiを表示させる
            const { data: dbWikis, error: dbError } = await supabaseServer
                .from('wikis')
                .select('slug');

            if (dbError) throw dbError;

            const wikiSlugsFromDB = dbWikis.map(w => w.slug);

            // 両方をマージして重複を排除
            const allWikiSlugs = Array.from(new Set([...wikiSlugsFromBlob, ...wikiSlugsFromDB]));

            return res.status(200).json(allWikiSlugs);

        } else {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e: any) {
        console.error('Critical API Error in /api/wikis:', e);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            details: e.message,
            stack: process.env.NODE_ENV === 'development' ? e.stack : undefined 
        });
    }
}
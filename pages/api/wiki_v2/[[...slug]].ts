import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClientServer';
import { createClient } from '@libsql/client';
import Pako from 'pako';
import { adminerUserId } from '@/utils/user_list';
import { randomUUID } from 'node:crypto';

// Turso クライアントの初期化
const turso = createClient({
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN!,
});

function formatNow() {
    const date = new Date();
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    const w = week[date.getDay()];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} (${w}) ${hh}:${mi}:${ss}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { slug: rawSlug } = req.query;
        const parts = Array.isArray(rawSlug) ? rawSlug : (rawSlug ? [rawSlug] : []);
        if (parts.length === 0) return res.status(400).json({ error: 'Wiki slug is required' });

        const wikiSlug = parts[0];
        const pageSlug = parts.length > 1 ? parts.slice(1).join('/') : 'FrontPage';

        // 認証処理
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabaseServer.auth.getUser(token);
            if (user) userId = user.id;
        }
        const isAdmin = adminerUserId.includes(userId || '');

        // Wiki設定の取得 (Supabase利用を継続)
        const { data: wiki } = await supabaseServer
            .from('wikis')
            .select('*')
            .eq('slug', wikiSlug)
            .maybeSingle();
        
        if (!wiki) return res.status(404).json({ error: 'Wiki not found' });

        // ======================
        // GET: 読み取り
        // ======================
        if (req.method === 'GET') {
            // Wiki内の全ページスラッグ一覧
            if (parts.length === 1) {
                const result = await turso.execute({
                    sql: "SELECT slug FROM wiki_pages WHERE wiki_slug = ?",
                    args: [wikiSlug]
                });

                return res.status(200).json({
                    wiki_slug: wikiSlug,
                    title: wiki.name,
                    page_slugs: result.rows.map(r => r.slug),
                    cli_used: wiki.cli_used
                });
            }

            // 個別ページ詳細
            const result = await turso.execute({
                sql: "SELECT title, content, updated_at, author_id FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });

            if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

            const row = result.rows[0];
            // BLOBデータをBase64に変換してフロントエンドに渡す
            const base64Content = Buffer.from(row.content as unknown as Uint8Array).toString('base64');

            return res.status(200).json({
                title: row.title,
                content: base64Content, // フロントエンドのPakoで解凍可能
                updated_at: row.updated_at,
                author_id: row.author_id
            });
        }

        // ======================
        // PUT / POST: 保存
        // ======================
        if (req.method === 'PUT' || req.method === 'POST') {
            const { content, title, slug: bodySlug } = req.body;
            if (content === undefined) return res.status(400).json({ error: "Content is required" });

            const targetSlug = req.method === 'POST' ? (bodySlug || pageSlug) : pageSlug;

            if (!isAdmin && wiki.edit_mode === 'private' && !userId) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // 圧縮処理
            const replacedContent = content.replace(/&now;/g, formatNow());
            const compressed = Pako.gzip(replacedContent, { level: 9 });
            const uint8Array = new Uint8Array(compressed);

            // Tursoに保存 (INSERT OR REPLACE で既存なら更新)
            await turso.execute({
                sql: `INSERT OR REPLACE INTO wiki_pages (id, slug, wiki_slug, title, content, updated_at, author_id) 
                      VALUES (COALESCE((SELECT id FROM wiki_pages WHERE wiki_slug = ? AND slug = ?), ?), ?, ?, ?, ?, ?, ?)`,
                args: [
                    wikiSlug, targetSlug, randomUUID(), // IDの決定
                    targetSlug, wikiSlug, title || "Untitled",
                    uint8Array, new Date().toISOString(), userId
                ]
            });

            return res.status(200).json({ success: true });
        }

        // ======================
        // DELETE: 削除
        // ======================
        if (req.method === 'DELETE') {
            if (pageSlug === "FrontPage") return res.status(400).json({ error: 'Cannot delete FrontPage' });
            if (!isAdmin && wiki.owner_id !== userId) return res.status(403).json({ error: 'Permission denied' });

            await turso.execute({
                sql: "DELETE FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (e: any) {
        console.error('Wiki Engine Error:', e);
        return res.status(500).json({ error: 'Internal Server Error', details: e.message });
    }
}
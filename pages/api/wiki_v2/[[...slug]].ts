import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClientServer';
import { createClient } from '@libsql/client';
import Pako from 'pako';
import { adminerUserId } from '@/utils/user_list';
import { randomUUID } from 'node:crypto';

// Turso クライアント
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

        // 認証
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabaseServer.auth.getUser(token);
            if (user) userId = user.id;
        }
        const isAdmin = adminerUserId.includes(userId || '');

        // Wiki設定取得
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

            const result = await turso.execute({
                sql: "SELECT title, content, updated_at, author_id, freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });

            if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

            const row = result.rows[0];
            const base64Content = Buffer.from(row.content as any).toString('base64');

            return res.status(200).json({
                title: row.title,
                content: base64Content,
                updated_at: row.updated_at,
                author_id: row.author_id,
                freeze: Boolean(row.freeze) // 確実にBoolean化
            });
        }

        // ======================
        // PUT / POST: 保存
        // ======================
        if (req.method === 'PUT' || req.method === 'POST') {
            const { content, title, slug: bodySlug } = req.body;
            if (content === undefined) return res.status(400).json({ error: "Content is required" });

            const targetSlug = req.method === 'POST' ? (bodySlug || pageSlug) : pageSlug;

            // 1. 現在の凍結状態をチェック
            const currentRecord = await turso.execute({
                sql: "SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, targetSlug]
            });
            const isFrozen = currentRecord.rows.length > 0 && Boolean(currentRecord.rows[0].freeze);

            // 2. 権限バリデーション
            if (!isAdmin) {
                if (isFrozen) {
                    return res.status(403).json({ error: 'This page is frozen.' });
                }
                if (wiki.edit_mode === 'private' && !userId) {
                    return res.status(403).json({ error: 'Access denied' });
                }
            }

            // 3. データ準備
            const replacedContent = content.replace(/&now;/g, formatNow());
            const compressed = Pako.gzip(replacedContent, { level: 9 });
            const uint8Array = new Uint8Array(compressed);

            // 4. 保存
            // freezeは「既存の状態を維持」するか、新規なら「false (0)」にする
            await turso.execute({
                sql: `INSERT OR REPLACE INTO wiki_pages (id, slug, wiki_slug, title, content, updated_at, author_id, freeze) 
                      VALUES (
                        COALESCE((SELECT id FROM wiki_pages WHERE wiki_slug = ? AND slug = ?), ?), 
                        ?, ?, ?, ?, ?, ?,
                        COALESCE((SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?), 0)
                      )`,
                args: [
                    wikiSlug, targetSlug, randomUUID(), 
                    targetSlug, wikiSlug, title || "Untitled",
                    uint8Array as any, new Date().toISOString(), userId,
                    wikiSlug, targetSlug
                ]
            });

            return res.status(200).json({ success: true });
        }

        // ======================
        // DELETE: 削除
        // ======================
        if (req.method === 'DELETE') {
            if (pageSlug === "FrontPage") return res.status(400).json({ error: 'Cannot delete FrontPage' });

            const currentRecord = await turso.execute({
                sql: "SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });
            const isFrozen = currentRecord.rows.length > 0 && Boolean(currentRecord.rows[0].freeze);

            if (!isAdmin) {
                if (isFrozen) return res.status(403).json({ error: 'This page is frozen.' });
                if (wiki.owner_id !== userId) return res.status(403).json({ error: 'Permission denied' });
            }

            await turso.execute({
                sql: "DELETE FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });

            return res.status(200).json({ success: true });
        }

        return res.status(405).end();

    } catch (e: any) {
        console.error('Wiki Engine Error:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
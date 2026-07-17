import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClientServer';
import { createClient } from '@libsql/client';
import Pako from 'pako';
import { adminerUserId } from '@/utils/user_list';
import { randomUUID } from 'node:crypto';

export const config = {
    regions: ['kix1'],
};

// Turso クライアント初期化
const turso = createClient({
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN!,
    //@ts-ignore
    pipeline: true,
});

function formatNow() {
    const date = new Date();
    const dateJST = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const week = ["日", "月", "火", "水", "木", "金", "土"];
    const w = week[dateJST.getDay()];
    const yyyy = dateJST.getFullYear();
    const mm = String(dateJST.getMonth() + 1).padStart(2, "0");
    const dd = String(dateJST.getDate()).padStart(2, "0");
    const hh = String(dateJST.getHours()).padStart(2, "0");
    const mi = String(dateJST.getMinutes()).padStart(2, "0");
    const ss = String(dateJST.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} (${w}) ${hh}:${mi}:${ss}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // CORS設定 (カンマ区切りに修正)
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cli, x-type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { slug: rawSlug } = req.query;
        const parts = Array.isArray(rawSlug) ? rawSlug : (rawSlug ? [rawSlug] : []);
        if (parts.length === 0) return res.status(400).json({ error: 'Wiki slug is required' });

        const wikiSlug = parts[0];
        const pageSlug = parts.length > 1 ? parts.slice(1).join('/') : 'FrontPage';

        // ======================
        // GET: 読み取り
        // ======================
        if (req.method === 'GET') {
            res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=59');
            if (parts.length === 1) {
                // ページリストとWiki情報の並列取得
                const [wikiRes, result] = await Promise.all([
                    supabaseServer.from('wikis').select('name, cli_used').eq('slug', wikiSlug).maybeSingle(),
                    turso.execute({
                        sql: "SELECT slug FROM wiki_pages WHERE wiki_slug = ?",
                        args: [wikiSlug]
                    })
                ]);

                if (!wikiRes.data) return res.status(404).json({ error: 'Wiki not found' });

                return res.status(200).json({
                    wiki_slug: wikiSlug,
                    title: wikiRes.data.name,
                    page_slugs: result.rows.map(r => r.slug),
                    cli_used: wikiRes.data.cli_used
                });
            }

            // 個別ページの取得
            const result = await turso.execute({
                sql: "SELECT id, title, content, updated_at, author_id, freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                args: [wikiSlug, pageSlug]
            });

            if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });

            const row = result.rows[0];
            const base64Content = Buffer.from(row.content as any).toString('base64');

            return res.status(200).json({
                page_id: row.id,
                title: row.title,
                content: base64Content,
                updated_at: row.updated_at,
                author_id: row.author_id,
                freeze: Boolean(row.freeze)
            });
        }

        // ======================
        // 2. 認証・Wiki情報の取得 (書き込み・削除時のみ実行)
        // ======================
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        // Supabaseのユーザー認証とWiki設定取得を Promise.all で完全並列化
        const [userRes, wikiRes] = await Promise.all([
            token ? supabaseServer.auth.getUser(token) : Promise.resolve({ data: { user: null } }),
            supabaseServer.from('wikis').select('*').eq('slug', wikiSlug).maybeSingle()
        ]);

        const userId = userRes.data.user?.id || null;
        const wiki = wikiRes.data;
        if (!wiki) return res.status(404).json({ error: 'Wiki not found' });

        const isCli = req.headers['x-cli'] === 'true';
        const rawtype = req.headers['type'];
        const type = Array.isArray(rawtype) ? rawtype[0] : rawtype;
        const isAdmin = adminerUserId.includes(userId || '');

        // ======================
        // PUT / POST: 保存
        // ======================
        if (req.method === 'PUT' || req.method === 'POST') {
            if (type === "rtcomment") {
                const { name, body } = req.body;
                const response = await supabaseServer.from('comments').insert({
                    name,
                    body,
                    wiki_slug: wikiSlug,
                    page_slug: pageSlug,
                    user_id: userId
                });
                if (response.error) return res.status(500).json({ error: response.error });
                return res.status(200).json({ success: true });
            } else {
                const { content, title, freeze, slug: bodySlug } = req.body;
                if (content === undefined) return res.status(400).json({ error: "Content is required" });
                
                const Nextfreeze = freeze ?? false;
                const targetSlug = req.method === 'POST' ? (bodySlug || pageSlug) : pageSlug;

                // 権限判定に必要な DB確認
                const currentRecord = await turso.execute({
                    sql: "SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?",
                    args: [wikiSlug, targetSlug]
                });
                const wasFrozen = currentRecord.rows.length > 0 && Boolean(currentRecord.rows[0].freeze);

                if (!isAdmin) {
                    if (wasFrozen) return res.status(403).json({ error: 'This page is frozen.' });
                    if (wiki.edit_mode === 'private' && !userId) return res.status(403).json({ error: 'Access denied' });
                    if (!userId && isCli) return res.status(403).json({ error: 'Access denied' });
                    if (wiki.cli_used === false && isCli && userId !== wiki.owner_id) return res.status(403).json({ error: 'Access denied' });
                }

                const finalContent = content.replace(/&now;/g, formatNow());
                const compressed = Pako.gzip(finalContent, { level: 9 });
                const uint8Array = new Uint8Array(compressed);
                const updatedAt = new Date().toISOString();

                // 保存実行
                await turso.execute({
                    sql: `INSERT OR REPLACE INTO wiki_pages (id, slug, wiki_slug, title, content, updated_at, author_id, freeze) 
                        VALUES (
                            COALESCE((SELECT id FROM wiki_pages WHERE wiki_slug = ? AND slug = ?), ?), 
                            ?, ?, ?, ?, ?, ?, ?
                        )`,
                    args: [
                        wikiSlug, targetSlug, randomUUID(),
                        targetSlug,
                        wikiSlug,
                        title || "Untitled",
                        uint8Array as any,
                        updatedAt,
                        userId,
                        Nextfreeze
                    ]
                });

                // 裏で更新処理を走らせる
                supabaseServer
                    .from("wikis")
                    .update({ updated_at: new Date(), updated_page: pageSlug })
                    .eq("slug", wikiSlug)
                    .then();

                return res.status(200).json({ success: true, cli: isCli });
            }
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
            
            // 裏で更新処理を走らせる
            supabaseServer
                .from("wikis")
                .update({ updated_at: new Date(), updated_page: pageSlug })
                .eq("slug", wikiSlug)
                .then();

            return res.status(200).json({ success: true });
        }

        return res.status(405).end();

    } catch (e: any) {
        console.error('Wiki Engine Error:', e);
        return res.status(500).json({ error: `Internal Server Error: ${e.message}` });
    }
}
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from '@/lib/supabaseClientServer';
import Pako from 'pako';
import { put, list, del, head } from '@vercel/blob';
import { adminerUserId } from '@/utils/user_list';

// Blobに保存するデータの型
interface BlobPageData {
    title: string;
    content: string; // Base64 (Gzipped)
    updated_at: string;
    author_id: string | null;
}

const getBlobPath = (wiki: string, page: string) => `asakura-wiki-blob/${wiki}/${page}.json`;

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
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { slug: rawSlug } = req.query;
        
        // 文字列か配列かに関わらず、確実に配列に変換する
        const parts = Array.isArray(rawSlug) 
            ? rawSlug 
            : (rawSlug ? [rawSlug] : []);

        if (parts.length === 0) {
            return res.status(400).json({ error: 'Wiki slug is required' });
        }

        const wikiSlug = parts[0];
        // 個別ページが指定されていない場合は空文字にするロジックを明確化
        const pageSlug = parts.length > 1 ? parts.slice(1).join('/') : 'FrontPage';
        const blobPath = getBlobPath(wikiSlug, pageSlug);

        // ====== ユーザー認証 (Supabase) ======
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const { data: { user } } = await supabaseServer.auth.getUser(token);
            if (user) userId = user.id;
        }
        const isAdmin = adminerUserId.includes(userId || '');

        // Wiki設定の取得 (編集モード等のメタデータはDB管理)
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
                const blobPrefix = `asakura-wiki-blob/${wikiSlug}/`; // 基準となるパス
                const { blobs } = await list({ 
                    prefix: blobPrefix,
                    token: process.env.BLOB_READ_WRITE_TOKEN 
                });

                return res.status(200).json({
                    wiki_slug: wikiSlug,
                    title: wiki.name,
                    page_slugs: blobs.map(b => {
                        return b.pathname
                            .replace(blobPrefix, '') // "asakura-wiki-blob/wiki/folder/sub.json" -> "folder/sub.json"
                            .replace('.json', '');   // "folder/sub.json" -> "folder/sub"
                    }),
                    cli_used: wiki.cli_used
                });
            }

            // ページ詳細の取得
            try {
                const blobInfo = await head(blobPath);
                const response = await fetch(blobInfo.url);
                const data: BlobPageData = await response.json();
                
                // フロントエンド側で展開するため、そのまま返す（効率的）
                return res.status(200).json(data);
            } catch {
                return res.status(404).json({ error: 'Page not found' });
            }
        }

        // ======================
        // PUT / POST: 保存
        // ======================
        if (req.method === 'PUT' || req.method === 'POST') {
            try {
                const { content, title, slug: bodySlug } = req.body;

                if (content === undefined) throw new Error("Content is undefined");
                
                const targetSlug = req.method === 'POST' ? (bodySlug || pageSlug) : pageSlug;
                const targetPath = getBlobPath(wikiSlug, targetSlug);

                // 権限チェック
                if (!isAdmin && wiki.edit_mode === 'private' && !userId) {
                    return res.status(403).json({ error: 'Access denied' });
                }

                // 2. 圧縮処理
                const replacedContent:string = content.replace(/&now;/g, formatNow());
                const compressed = Pako.gzip(replacedContent, { level: 9 });
                const base64Content = Buffer.from(compressed).toString('base64');
                
                const payload: BlobPageData = {
                    title: title || "Untitled",
                    content: base64Content,
                    updated_at: new Date().toISOString(),
                    author_id: userId
                };

                // --- ここで上書き問題を回避するための前処理 ---
                // 型定義に 'overwrite' がない場合、一度消すのが最も確実です
                try {
                    await del(targetPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
                } catch (e) {
                    // ファイルが存在しない場合は無視して進む
                }

                // 4. Blobへ送信
                const blobResult = await put(targetPath, JSON.stringify(payload), {
                    access: 'public',
                    contentType: 'application/json',
                    addRandomSuffix: false, 
                    cacheControlMaxAge: 0,
                    token: process.env.BLOB_READ_WRITE_TOKEN,
                });

                return res.status(200).json({ success: true, url: blobResult.url });

            } catch (err: any) {
                console.error("Critical API Error:", err);
                return res.status(500).json({ 
                    error: 'Blob storage operation failed', 
                    details: err.message,
                    step: "PUT_PROCESS" 
                });
            }
        }

        // ======================
        // DELETE: 削除
        // ======================
        if (req.method === 'DELETE') {
            if (pageSlug === "FrontPage") return res.status(400).json({ error: 'Cannot delete FrontPage' });
            if (!isAdmin && wiki.owner_id !== userId) return res.status(403).json({ error: 'Permission denied' });

            await del(blobPath);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (e: any) {
        console.error('Wiki Engine Error:', e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
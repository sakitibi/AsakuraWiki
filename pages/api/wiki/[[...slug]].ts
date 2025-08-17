import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from 'lib/supabaseClientServer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const raw = req.query.slug
        const parts = Array.isArray(raw)
        ? raw
        : typeof raw === 'string'
            ? [raw]
            : []

        if (parts.length === 0) {
            return res.status(400).json({ error: 'Invalid path' })
        }

        const wikiSlug = parts[0]
        const pageSlug = parts.slice(1).join('/') || 'FrontPage'

        // ======================
        // GET: ページ取得
        // ======================
        if (req.method === 'GET') {
            const { data, error } = await supabaseServer
                .from('wiki_pages')
                .select(`
                id,
                wiki_id,
                slug,
                wiki_slug,
                title,
                content,
                description,
                owner_id,
                author_id,
                created_at,
                updated_at,
                wikis:wiki_id (
                    edit_mode
                )
                `)
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)
                .maybeSingle()

            if (error) {
                console.error('Supabase GET error:', error)
                return res.status(500).json({ error: error.message })
            }
            if (!data) {
                return res.status(404).json({ error: 'Page not found' })
            }

            return res.status(200).json(data)
        }

        // ======================
        // PUT: ページ更新
        // ======================
        if (req.method === 'PUT') {
            const { content, title, user } = req.body
            if (typeof content !== 'string' || typeof title !== 'string') {
                return res.status(400).json({ error: 'Invalid request body' })
            }

            const { data: wiki, error: wikiError } = await supabaseServer
                .from('wikis')
                .select('edit_mode, owner_id')
                .eq('slug', wikiSlug)
                .maybeSingle()

            if (wikiError) return res.status(500).json({ error: wikiError.message })
            if (!wiki) return res.status(404).json({ error: 'Wiki not found' })

            if (wiki.edit_mode === 'private' && (!user || !user.id)) {
                return res.status(403).json({ error: 'Not authorized to edit' })
            }

            const { error } = await supabaseServer
                .from('wiki_pages')
                .update({ content, title, updated_at: new Date() })
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)

            if (error) return res.status(500).json({ error: error.message })
            return res.status(200).json({ success: true })
        }

        // ======================
        // DELETE: ページ削除
        // ======================
        if (req.method === 'DELETE') {
            const userId = (req as any).user?.id || null

            const { data: wiki, error: wikiError } = await supabaseServer
                .from('wikis')
                .select('id, edit_mode')
                .eq('slug', wikiSlug)
                .maybeSingle()

            if (wikiError) return res.status(500).json({ error: wikiError.message })
            if (!wiki) return res.status(404).json({ error: 'Wiki not found' })

            if (wiki.edit_mode === 'private' && (!userId)) {
                return res.status(403).json({ error: 'Forbidden' })
            }

            const { error: deleteError } = await supabaseServer
                .from('wiki_pages')
                .delete()
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)

            if (deleteError) return res.status(500).json({ error: deleteError.message })
            return res.status(200).json({ success: true })
        }

        // ======================
        // POST: 新規ページ作成
        // ======================
        if (req.method === 'POST') {
            const { slug, title, content, user } = req.body
            if (!slug || !title || !content) {
                return res.status(400).json({ error: 'Missing parameters' })
        }

        const { data: wiki, error: wikiError } = await supabaseServer
            .from('wikis')
            .select('edit_mode, owner_id')
            .eq('slug', wikiSlug)
            .maybeSingle()

        if (wikiError) return res.status(500).json({ error: wikiError.message })
        if (!wiki) return res.status(404).json({ error: 'Wiki not found' })

        if (wiki.edit_mode === 'private' && (!user || !user.id)) {
            return res.status(403).json({ error: 'Not authorized to create page' })
        }

        const { data, error } = await supabaseServer
            .from('wiki_pages')
            .insert([{ wiki_slug: wikiSlug, slug, title, content, author_id: user?.id ?? null }])
            .select()
            .maybeSingle()

        if (error) return res.status(500).json({ error: error.message })
            return res.status(200).json(data)
        }

        // ======================
        // 許可されていないメソッド
        // ======================
        res.setHeader('Allow', ['GET','PUT','DELETE','POST'])
        return res.status(405).json({ error: 'Method not allowed' })

    } catch (e) {
        console.error('API exception:', e)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from 'lib/supabaseClientServer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // クエリから [wikiSlug, ...pageSlugParts] を取得
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

        if (req.method === 'GET') {
        // 必要なフィールドをすべて列挙して取得
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
            updated_at
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

        // 取得したレコードをそのまま返却
        return res.status(200).json(data)
        }

        if (req.method === 'PUT') {
        const { content, title } = req.body
        if (typeof content !== 'string' || typeof title !== 'string') {
            return res.status(400).json({ error: 'Invalid request body' })
        }

        const { error } = await supabaseServer
            .from('wiki_pages')
            .update({ content, title, updated_at: new Date() })
            .eq('wiki_slug', wikiSlug)
            .eq('slug', pageSlug)

        if (error) {
            console.error('Supabase PUT error:', error)
            return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (e) {
        console.error('API exception:', e)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
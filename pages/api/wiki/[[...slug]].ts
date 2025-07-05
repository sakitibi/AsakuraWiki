import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // slug は [wikiSlug, ...pageSlugParts]
        const raw = req.query.slug
        const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []
        if (parts.length === 0) {
        return res.status(400).json({ error: 'Invalid path' })
        }

        const wikiSlug = parts[0]
        // pageSlugParts が空なら FrontPage をデフォルト
        const pageSlug = parts.slice(1).join('/') || 'FrontPage'

        if (req.method === 'GET') {
        // content のみ取得
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('content')
            .eq('wiki_slug', wikiSlug)
            .eq('slug', pageSlug)
            .maybeSingle()

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }
        if (!data) {
            return res.status(404).json({ error: 'Page not found' })
        }

        // { content: '…' }
        return res.status(200).json({ content: data.content })
        }

        if (req.method === 'PUT') {
        const { content, title } = req.body
        if (typeof content !== 'string' || typeof title !== 'string') {
            return res.status(400).json({ error: 'Invalid body' })
        }

        const { error } = await supabase
            .from('wiki_pages')
            .update({ content, title, updated_at: new Date() })
            .eq('wiki_slug', wikiSlug)
            .eq('slug', pageSlug)

        if (error) {
            console.error(error)
            return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({ success: true })
        }

        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: 'Internal error' })
    }
}
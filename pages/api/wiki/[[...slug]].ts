import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServer } from 'lib/supabaseClientServer';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        const raw:string | string[] | undefined = req.query.slug
        const parts: string[] = Array.isArray(raw)
            ? raw
            : typeof raw === 'string'
                ? [raw]
                : []

        if (parts.length === 0) {
            return res.status(400).json({ error: 'Invalid path' })
        }

        const wikiSlug: string = parts[0]
        const pageSlug: string = parts.slice(1).join('/') || 'FrontPage'

        // ====== 認証ユーザー取得 ======
        let userId: string | null = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
            if (authError) console.error('Supabase auth error:', authError)
            if (user) userId = user.id
        }

        const isCLI:boolean = req.headers['x-cli'] === 'true' // CLI 判定用

        // CLI 用チェック関数
        const checkCLIAllowed = async () => {
            const { data: wiki, error } = await supabaseServer
                .from('wikis')
                .select('cli_used')
                .eq('slug', wikiSlug)
                .maybeSingle()

            if (error) throw new Error('Failed to fetch wiki cli_used: ' + error.message)
            if (!wiki) throw { status: 404, message: 'Wiki not found' }
            return wiki
        }

        // ======================
        // GET: ページ取得 or ページ一覧
        // ======================
        if (req.method === 'GET') {
            if (parts.length === 1) {
                const { data: pages, error: pagesErr } = await supabaseServer
                    .from('wiki_pages')
                    .select('slug')
                    .eq('wiki_slug', wikiSlug)

                if (pagesErr) return res.status(500).json({ error: pagesErr.message })

                const { data: wiki, error: wikiErr } = await supabaseServer
                    .from('wikis')
                    .select('cli_used, name')
                    .eq('slug', wikiSlug)
                    .maybeSingle()

                if (wikiErr) return res.status(500).json({ error: wikiErr.message })

                return res.status(200).json({
                    wiki_slug: wikiSlug,
                    title: wiki?.name,
                    page_slugs: pages.map(p => p.slug),
                    cli_used: wiki?.cli_used ?? false
                })
            }

            const { data: page, error: pageErr } = await supabaseServer
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

            if (pageErr) return res.status(500).json({ error: pageErr.message })
            if (!page) return res.status(404).json({ error: 'Page not found' })

            return res.status(200).json(page)
        }

        // ======================
        // PUT: ページ更新
        // ======================
        if (req.method === 'PUT') {
            if (isCLI) await checkCLIAllowed() // CLI のみチェック
            const { content, title } = req.body
            if (typeof content !== 'string' || typeof title !== 'string') {
                return res.status(400).json({ error: 'Invalid request body' })
            }

            // まず対象ページが存在するか確認
            const { data: existingPage, error: existingErr } = await supabaseServer
                .from('wiki_pages')
                .select('id')
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)
                .maybeSingle()

            if (existingErr) return res.status(500).json({ error: existingErr.message })
            if (!existingPage) {
                return res.status(404).json({ error: `${pageSlug} not found` })
            }

            const { data: wiki, error: wikiError } = await supabaseServer
                .from('wikis')
                .select('edit_mode, owner_id')
                .eq('slug', wikiSlug)
                .maybeSingle()

            if (wikiError) return res.status(500).json({ error: wikiError.message })
            if (!wiki) return res.status(404).json({ error: 'Wiki not found' })

            if (wiki.edit_mode === 'private' && !userId) {
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
            if (isCLI) await checkCLIAllowed() // CLI のみチェック
            // まず対象ページが存在するか確認
            const { data: existingPage, error: existingErr } = await supabaseServer
                .from('wiki_pages')
                .select('id')
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)
                .maybeSingle()

            if (existingErr) return res.status(500).json({ error: existingErr.message })
            if (!existingPage) {
                return res.status(404).json({ error: `${pageSlug} not found` })
            }

            // FrontPage は削除不可
            if (pageSlug === "FrontPage") {
                return res.status(400).json({ error: 'FrontPage cannot be deleted' })
            }

            const { data: wiki, error: wikiError } = await supabaseServer
                .from('wikis')
                .select('id, edit_mode, owner_id')
                .eq('slug', wikiSlug)
                .maybeSingle()

            if (wikiError) return res.status(500).json({ error: wikiError.message })
            if (!wiki) return res.status(404).json({ error: 'Wiki not found' })

            if (wiki.edit_mode === 'private' && !userId) {
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
            if (isCLI) await checkCLIAllowed() // CLI のみチェック
            const { slug, title, content } = req.body
            if (!slug || !title || !content) {
                return res.status(400).json({ error: 'Missing parameters' })
            }

            const { data: wiki, error: wikiError } = await supabaseServer
                .from('wiki_pages')
                .insert([{ wiki_slug: wikiSlug, slug, title, content, author_id: userId }])
                .select()
                .maybeSingle()

            if (wikiError) return res.status(500).json({ error: wikiError.message })
            return res.status(200).json(wiki)
        }

        // ======================
        // 許可されていないメソッド
        // ======================
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST'])
        return res.status(405).json({ error: 'Method not allowed' })

    } catch (e:any) {
        console.error('API exception:', e)
        return res.status(500).json({ error: e.message || 'Internal server error' })
    }
}

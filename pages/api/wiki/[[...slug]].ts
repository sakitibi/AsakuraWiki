import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try{
        let slug = req.query.slug;
        // slugは配列の場合があるので文字列に結合
        if (Array.isArray(slug)) {
            slug = slug.join('/');
        }
        if (typeof slug !== 'string' || slug.length === 0) {
            return res.status(400).json({ error: 'Invalid slug' });
        }

        if (req.method === 'GET') {
        const { data, error } = await supabase
        .from('wiki_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle(); // <= 存在しない場合は null を返す

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: error.message });
            }
            if (!data) return res.status(404).json({ error: 'Not found' });

            return res.status(200).json(data);

        } else if (req.method === 'PUT') {
            const { content, title } = req.body;

            if (typeof content !== 'string' || typeof title !== 'string') {
            return res.status(400).json({ error: 'Invalid request body' });
            }

            const { error } = await supabase
            .from('wiki_pages')
            .update({ content, title, updated_at: new Date() })
            .eq('slug', slug);

            if (error) return res.status(500).json({ error: error.message });

            return res.status(200).json({ success: true });

        } else {
            res.setHeader('Allow', ['GET', 'PUT']);
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch(e){
        console.error('API例外:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
}
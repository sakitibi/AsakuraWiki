
    import { useState } from 'react';
    import { useRouter } from 'next/router'
    import { useUser } from '@supabase/auth-helpers-react';
    import { supabase } from 'lib/supabaseClient';
    
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    const user = useUser();
    const userId = user?.id; // ← ここを insert 時に使う！
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const cmdStr = typeof cmd === 'string' ? cmd : '';

    // クエリ→文字列化
        const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
        const pageSlugStr =
        typeof pageQuery === 'string'
            ? pageQuery
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';
    
    export const handlePageLike = async () => {
        setLoading(true);

        const { data, error: fetchError } = await supabase
            .from('pages_liked')
            .select('like, heikinlike')
            .eq('wiki_slug', wikiSlugStr)
            .eq('page_slug', pageSlugStr)
            .maybeSingle();

        if (fetchError) {
            alert('現在の評価取得に失敗しました: ' + fetchError?.message);
            setLoading(false);
            return;
        }

        if (!data) {
            await supabase.from('pages_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                page_slug: pageSlugStr,
                like: 1,
                dislike: 0,
                heikinlike: 1,
                created_at: new Date() // ←ここ重要
            });
        } else {
            const updatedLike = (data.like ?? 0) + 1;
            const updatedHeikinLike = (data.heikinlike ?? 0) + 1;

            await supabase
                .from('pages_liked')
                .update({
                    like: updatedLike,
                    heikinlike: updatedHeikinLike,
                })
                .eq('wiki_slug', wikiSlugStr)
                .eq('page_slug', pageSlugStr);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    export const handlePageDisLike = async () => {
        setLoading(true);

        const { data, error: fetchError } = await supabase
            .from('pages_liked')
            .select('dislike, heikinlike')
            .eq('wiki_slug', wikiSlugStr)
            .eq('page_slug', pageSlugStr)
            .maybeSingle();

        if (fetchError) {
            alert('現在の評価取得に失敗しました: ' + fetchError?.message);
            setLoading(false);
            return;
        }

        if (!data) {
            await supabase.from('pages_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                page_slug: pageSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
                created_at: new Date() // ←ここ重要
            });
        } else {
            const updatedLike = (data.dislike ?? 0) + 1;
            const updatedHeikinLike = (data.heikinlike ?? 0) - 1;

            await supabase
                .from('pages_liked')
                .update({
                    like: updatedLike,
                    heikinlike: updatedHeikinLike,
                })
                .eq('wiki_slug', wikiSlugStr)
                .eq('page_slug', pageSlugStr);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };
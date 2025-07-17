'use client'; // ← App Routerの場合は必須！

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from 'lib/supabaseClient';

const usePageLikeHandlers = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const user = useUser();
    const userId = user?.id;

    const { wikiSlug, pageSlug, page: pageQuery } = router.query;

    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr =
        typeof pageQuery === 'string'
        ? pageQuery
        : Array.isArray(pageSlug)
        ? pageSlug.join('/')
        : pageSlug ?? 'FrontPage';

    const handlePageLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error: fetchError } = await supabase
        .from('pages_liked')
        .select('like, heikinlike')
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr)
        .maybeSingle();

        if (fetchError) {
        console.error('取得エラー:', fetchError.message);
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
            create_at: new Date()
        });
        } else {
        const updatedLike = (data.like ?? 0) + 1;
        const updatedHeikinLike = (data.heikinlike ?? 0) + 1;

        await supabase
            .from('pages_liked')
            .update({
            like: updatedLike,
            heikinlike: updatedHeikinLike
            })
            .eq('wiki_slug', wikiSlugStr)
            .eq('page_slug', pageSlugStr);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    const handlePageDisLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error: fetchError } = await supabase
        .from('pages_liked')
        .select('dislike, heikinlike')
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr)
        .maybeSingle();

        if (fetchError) {
        console.error('取得エラー:', fetchError.message);
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
            create_at: new Date()
        });
        } else {
        const updatedDislike = (data.dislike ?? 0) + 1;
        const updatedHeikinLike = Math.max((data.heikinlike ?? 0) - 1, 0);

        await supabase
            .from('pages_liked')
            .update({
            dislike: updatedDislike,
            heikinlike: updatedHeikinLike
            })
            .eq('wiki_slug', wikiSlugStr)
            .eq('page_slug', pageSlugStr);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };
    return { handlePageLike, handlePageDisLike, loading };
};

export default usePageLikeHandlers;
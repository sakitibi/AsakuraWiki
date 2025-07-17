'use client';

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

        const { data, error } = await supabase
        .from('pages_liked')
        .select('like, dislike')
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr)
        .maybeSingle();

        if (error) {
            console.error('取得エラー:', error.message);
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
                created_at: new Date()
            });
        } else {
            const updatedLike = (data.like ?? 0) + 1;
            const updatedDislike = data.dislike ?? 0;
            const updatedHeikinLike = updatedLike - updatedDislike;

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

        const { data, error } = await supabase
        .from('pages_liked')
        .select('like, dislike')
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr)
        .maybeSingle();

        if (error) {
            console.error('取得エラー:', error.message);
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
                created_at: new Date()
            });
        } else {
        const updatedDislike = (data.dislike ?? 0) + 1;
        const updatedLike = data.like ?? 0;
        const updatedHeikinLike = updatedLike - updatedDislike;

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
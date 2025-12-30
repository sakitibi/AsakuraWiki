'use client';

import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { User, useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from 'lib/supabaseClientServer';
import { supabaseClient } from '@/lib/supabaseClient';

export const usePageLikeHandlers = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const router:NextRouter = useRouter();
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const userId:string | undefined = user?.id;

    const { wikiSlug, pageSlug, page: pageQuery } = router.query;

    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr:string =
        typeof pageQuery === 'string'
        ? pageQuery
        : Array.isArray(pageSlug)
        ? pageSlug.join('/')
        : pageSlug ?? 'FrontPage';

    const handlePageLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseServer
        .from('pages_liked')
        .select('user_id, like, dislike')
        .eq('user_id', userId) // ✅ 正しく使えてる
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr) // for pages_liked
        .maybeSingle();
        console.log('一致したレコード:', data);
        if (error) {
            console.error('取得エラー:', error.message);
            setLoading(false);
            return;
        }

    if (!data) {
        // 初評価
        await supabaseServer.from('pages_liked').insert({
            user_id: userId,
            wiki_slug: wikiSlugStr,
            page_slug: pageSlugStr,
            like: 1,
            dislike: 0,
            heikinlike: 1,
            created_at: new Date().toISOString()
        });
    } else if (data.like === 1) {
    // 👍を再度押した → 取り消し
        await supabaseServer
        .from('pages_liked')
        .update({ like: 1, dislike: 0, heikinlike: 1 })
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr);
    } else {
        await supabaseServer
        .from('pages_liked')
        .update({ like: 1, dislike: 0, heikinlike: 1 })
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr);
    }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    const handlePageDisLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseServer
        .from('pages_liked')
        .select('user_id, like, dislike')
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr)
        .maybeSingle();

        if (error) {
            console.error('取得エラー:', error.message);
            setLoading(false);
            return;
        }

        if (!data) {
            // 初評価
            await supabaseServer.from('pages_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                page_slug: pageSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
                created_at: new Date().toISOString()
            });
        } else if (data.dislike === 1) {
            // 👍を再度押した → 取り消し
            await supabaseServer.from('pages_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
                .eq('page_slug', pageSlugStr);
        } else {
            // 👍から👎へ変更
            await supabaseServer.from('pages_liked').update({
                like: 0,
                dislike: 1,
                heikinlike: -1
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
                .eq('page_slug', pageSlugStr);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    return { handlePageLike, handlePageDisLike, loading };
};
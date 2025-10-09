'use client';

import { useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { User, useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from 'lib/supabaseClientServer';

export const useWikiLikeHandlers = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const router:NextRouter = useRouter();
    const user:User | null = useUser();
    const userId:string | undefined = user?.id;

    const { wikiSlug, pageSlug, page: pageQuery } = router.query;

    const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr:string =
        typeof pageQuery === 'string'
        ? pageQuery
        : Array.isArray(pageSlug)
        ? pageSlug.join('/')
        : pageSlug ?? 'FrontPage';
    const handleWikiLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseServer
        .from('wikis_liked')
        .select('user_id, like, dislike')
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .maybeSingle();

        if (error) {
            console.error('取得エラー:', error.message);
            console.error('Supabaseエラー:', error); // message以外も見る
            setLoading(false);
            return;
        }

        if (!data) {
            // 初評価
            await supabaseServer.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 1,
                dislike: 0,
                heikinlike: 1,
                created_at: new Date().toISOString()
            });
        } else if (data.like === 1) {
            // 👍を再度押した → 取り消し
            await supabaseServer.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 👎から👍へ変更
            await supabaseServer.from('wikis_liked').update({
                like: 1,
                dislike: 0,
                heikinlike: 1
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    const handleWikiDisLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseServer
        .from('wikis_liked')
        .select('user_id, like, dislike')
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .maybeSingle();

        if (error) {
            console.error('取得エラー:', error.message);
            console.error('Supabaseエラー:', error); // message以外も見る
            setLoading(false);
            return;
        }

        if (!data) {
            // 初評価
            await supabaseServer.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
                created_at: new Date().toISOString()
            });
        } else if (data.dislike === 1) {
            // 👍を再度押した → 取り消し
            await supabaseServer.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 👍から👎へ変更
            await supabaseServer.from('wikis_liked').update({
                like: 0,
                dislike: 1,
                heikinlike: -1
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    return { handleWikiLike, handleWikiDisLike, loading };
};
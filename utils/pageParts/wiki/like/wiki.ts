'use client';

import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';
import { fetchAndSetUser } from '@/lib/authGetUser';

export const useWikiLikeHandlers = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const router:NextRouter = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // ユーザー情報を取得
        fetchAndSetUser(supabaseClient, setUser);
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
    const handleWikiLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseClient
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
            await supabaseClient.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 1,
                dislike: 0,
                heikinlike: 1,
                created_at: new Date().toISOString()
            });
        } else if (data.like === 1) {
            // 高評価を再度押した → 取り消し
            await supabaseClient.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 低評価から高評価へ変更
            await supabaseClient.from('wikis_liked').update({
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

        const { data, error } = await supabaseClient
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
            await supabaseClient.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
                created_at: new Date().toISOString()
            });
        } else if (data.dislike === 1) {
            // 低評価を再度押した → 取り消し
            await supabaseClient.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 高評価から低評価へ変更
            await supabaseClient.from('wikis_liked').update({
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
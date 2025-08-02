'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { supabaseBrowser } from 'lib/supabaseClientBrowser';

export const usePageLikeHandlers = () => {
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

        const { data, error } = await supabaseBrowser
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
        await supabaseBrowser.from('pages_liked').insert({
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
        await supabaseBrowser
        .from('pages_liked')
        .update({ like: 1, dislike: 0, heikinlike: 1 })
        .eq('user_id', userId)
        .eq('wiki_slug', wikiSlugStr)
        .eq('page_slug', pageSlugStr);
    } else {
        await supabaseBrowser
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

        const { data, error } = await supabaseBrowser
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
            await supabaseBrowser.from('pages_liked').insert({
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
            await supabaseBrowser.from('pages_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
                .eq('page_slug', pageSlugStr);
        } else {
            // 👍から👎へ変更
            await supabaseBrowser.from('pages_liked').update({
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

export const useWikiLikeHandlers = () => {
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

    const handleWikiLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data, error } = await supabaseBrowser
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
            await supabaseBrowser.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 1,
                dislike: 0,
                heikinlike: 1,
                created_at: new Date().toISOString()
            });
        } else if (data.like === 1) {
            // 👍を再度押した → 取り消し
            await supabaseBrowser.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 👎から👍へ変更
            await supabaseBrowser.from('wikis_liked').update({
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

        const { data, error } = await supabaseBrowser
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
            await supabaseBrowser.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
                created_at: new Date().toISOString()
            });
        } else if (data.dislike === 1) {
            // 👍を再度押した → 取り消し
            await supabaseBrowser.from('wikis_liked').update({
                like: 0,
                dislike: 0,
                heikinlike: 0
            }).eq('user_id', userId)
                .eq('wiki_slug', wikiSlugStr)
        } else {
            // 👍から👎へ変更
            await supabaseBrowser.from('wikis_liked').update({
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
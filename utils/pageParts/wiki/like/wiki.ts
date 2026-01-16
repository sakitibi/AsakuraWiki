import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';

export const useWikiLikeHandlers = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });
    }, []);

    const userId = user?.id;
    const { wikiSlug, page: pageQuery } = router.query;

    const wikiSlugStr =
        Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr =
        typeof pageQuery === 'string' ? pageQuery : 'FrontPage';

    const update = async (like: number, dislike: number, heikinlike: number) => {
        await supabaseClient
            .from('wikis_liked')
            .update({ like, dislike, heikinlike })
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlugStr);
    };

    const handleWikiLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data } = await supabaseClient
            .from('wikis_liked')
            .select('like')
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlugStr)
            .maybeSingle();

        if (!data) {
            await supabaseClient.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 1,
                dislike: 0,
                heikinlike: 1,
            });
        } else if (data.like === 1) {
            await update(0, 0, 0);
        } else {
            await update(1, 0, 1);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    const handleWikiDisLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data } = await supabaseClient
            .from('wikis_liked')
            .select('dislike')
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlugStr)
            .maybeSingle();

        if (!data) {
            await supabaseClient.from('wikis_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlugStr,
                like: 0,
                dislike: 1,
                heikinlike: -1,
            });
        } else if (data.dislike === 1) {
            await update(0, 0, 0);
        } else {
            await update(0, 1, -1);
        }

        setLoading(false);
        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    };

    return { handleWikiLike, handleWikiDisLike, loading };
};

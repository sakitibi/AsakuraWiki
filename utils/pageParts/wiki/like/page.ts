import { useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';

interface Params {
    wikiSlug: string;
    pageSlug: string;
    onComplete: () => void;
}

export const usePageLikeHandlers = ({ wikiSlug, pageSlug, onComplete }: Params) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });
    }, []);

    const userId = user?.id;

    const update = async (like: number, dislike: number, heikinlike: number) => {
        await supabaseClient
            .from('pages_liked')
            .update({ like, dislike, heikinlike })
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlug)
            .eq('page_slug', pageSlug);
    };

    const handlePageLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data } = await supabaseClient
            .from('pages_liked')
            .select('like')
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlug)
            .eq('page_slug', pageSlug)
            .maybeSingle();

        if (!data) {
            await supabaseClient.from('pages_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlug,
                page_slug: pageSlug,
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
        onComplete();
    };

    const handlePageDisLike = async () => {
        if (!userId) return;
        setLoading(true);

        const { data } = await supabaseClient
            .from('pages_liked')
            .select('dislike')
            .eq('user_id', userId)
            .eq('wiki_slug', wikiSlug)
            .eq('page_slug', pageSlug)
            .maybeSingle();

        if (!data) {
            await supabaseClient.from('pages_liked').insert({
                user_id: userId,
                wiki_slug: wikiSlug,
                page_slug: pageSlug,
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
        onComplete();
    };

    return { handlePageLike, handlePageDisLike, loading };
};

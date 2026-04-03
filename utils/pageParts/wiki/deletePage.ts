import { NextRouter } from "next/router";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { User } from "@supabase/supabase-js";

export default async function deletePage(
    wikiSlugStr: string,
    pageSlugStr: string,
    router: NextRouter,
    user: User
){
    if (pageSlugStr === 'FrontPage') {
        alert('FrontPage は削除できません');
        router.replace(`/wiki/${wikiSlugStr}`);
        return;
    }

    const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
    if (!ok) {
        router.replace(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
        return;
    }

    try {
        const { data: { session } } = await supabaseServer.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: { id: user?.id } }),
        });

        if (!res.ok) {
            const err = await res.json();
            alert('削除に失敗しました: ' + err.error);
        } else {
            alert('削除しました');
            router.replace(`/wiki/${wikiSlugStr}`);
        }
    } catch (err: any) {
        console.error(err);
        alert('削除に失敗しました: ' + err.message);
    }
};
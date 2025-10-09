import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { NextRouter } from "next/router";

export const handleUpdate = async (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    editMode: editMode,
    user: User | null,
    wikiSlugStr: string,
    pageSlugStr: string,
    title: string,
    content: string,
    router: NextRouter
) => {
    if (editMode === 'private' && !user) {
        alert("403 Forbidden あなたは編集する権限がありません");
        location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
        return;
    }

    setLoading(true);
    try {
        const { data: { session } } = await supabaseServer.auth.getSession();
        const token = session?.access_token;

        const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
        });

        if (!res.ok) {
            const err = await res.json();
            alert('更新に失敗しました: ' + err.error);
            return;
        }

        router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
    } finally {
        setLoading(false);
    }
};

// 編集モード切り替え
export const handleEdit = (
    router: NextRouter,
    wikiSlugStr: string,
    pageSlugStr: string
) => {
    router.push({
        pathname: `/wiki/${wikiSlugStr}`,
        query: { cmd: 'edit', page: pageSlugStr },
    });
};
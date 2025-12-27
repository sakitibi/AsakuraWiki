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

export const handleDelete = async (
    special_wiki_list_found: string | undefined,
    wikiSlugStr: string,
    pageSlugStr: string,
    router: NextRouter
) => {
    if (!special_wiki_list_found) {
        const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
        if (!ok) return;

        const { data: { session } } = await supabaseServer.auth.getSession();
        const token = session?.access_token;

        try {
            const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                alert('削除に失敗しました: ' + data.error);
            } else {
                alert('削除しました');
                router.replace(`/wiki/${wikiSlugStr}`);
            }
        } catch (err: any) {
            console.error(err);
            alert('削除に失敗しました: ' + err.message);
        }
    }
};

export const handleFreeze = async(
    wikiSlugStr:string,
    pageSlugStr:string,
    user: User | null
) => {
    const { data: pageData, error: pageSelectError} = await supabaseServer
        .from("wiki_pages")
        .select("slug,freeze")
        .eq("slug", pageSlugStr)
        .maybeSingle()
    if(pageSelectError){
        console.error("PageSelectError: ", pageSelectError.message);
        return;
    }
    const { data: wikiData, error: wikiSelectError} = await supabaseServer
        .from("wikis")
        .select("owner_id")
        .eq("slug", wikiSlugStr)
        .maybeSingle()
    if(wikiSelectError){
        console.error("WikiSelectError: ", wikiSelectError.message);
        return;
    }
    if(user?.id !== wikiData?.owner_id){
        console.error("Error 403 Forbidden");
        return;
    }
    const { error: updateError } = await supabaseServer
        .from("wiki_pages")
        .update({
            freeze: !pageData?.freeze
        })
        .eq("slug", pageSlugStr)
    if(updateError){
        console.error("InsertError: ", updateError.message)
        return;
    }
    alert(`${pageData?.freeze ? "凍結解除成功!" : "凍結成功!"}`);
}
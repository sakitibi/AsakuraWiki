import { NextRouter, useRouter } from "next/router";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { special_wiki_list } from "@/utils/wiki_list";

const router:NextRouter = useRouter();
const { wikiSlug,  pageSlug, page: pageQuery, cmd } = router.query;
const cmdStr:string = typeof router.query.cmd === 'string' ? router.query.cmd : '';
const special_wiki_list_found:string | undefined = special_wiki_list.find(value => value === wikiSlugStr);

// クエリ→文字列化
const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
const pageSlugStr:string =
typeof pageQuery === 'string'
    ? pageQuery
    : Array.isArray(pageSlug)
    ? pageSlug.join('/')
    : pageSlug ?? 'FrontPage';
// 編集モード切り替え
export const handleEdit = () => {
    router.push({
        pathname: `/wiki/${wikiSlugStr}`,
        query: { cmd: 'edit', page: pageSlugStr },
    });
};

export const handleDelete = async () => {
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
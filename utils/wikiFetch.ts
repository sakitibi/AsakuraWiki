import { supabaseServer } from "@/lib/supabaseClientServer";
import type { editMode, designColor } from '@/utils/wiki_settings';

export interface Page {
    title: string;
    content: string;
}

export default async function wikiFetch(
    wikiSlugStr: string,
    pageSlugStr: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setEditMode: React.Dispatch<React.SetStateAction<editMode>>,
    setPage: React.Dispatch<React.SetStateAction<Page | null>>,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
    setContent: React.Dispatch<React.SetStateAction<string>>
){
    try {
        // Wiki情報取得
        const { data: wikiData, error: wikiError } = await supabaseServer
            .from('wikis')
            .select('edit_mode')
            .eq('slug', wikiSlugStr)
            .maybeSingle();

        if (wikiError || !wikiData) {
            setError('Wikiの情報取得に失敗しました');
            setLoading(false);
            return;
        }

        setEditMode(wikiData.edit_mode);

        // ページ情報取得
        const { data: pageData, error: pageError } = await supabaseServer
            .from('wiki_pages')
            .select('title, content')
            .eq('wiki_slug', wikiSlugStr)
            .eq('slug', pageSlugStr)
            .maybeSingle();

        if (pageError || !pageData) {
            setError('ページの読み込みに失敗しました');
            setPage(null);
        } else {
            setPage(pageData);
            setTitle(pageData.title);
            setContent(pageData.content);
            setError(null);
        }
    } catch (err) {
        console.error(err);
        setError('ページ読み込み中にエラーが発生しました');
    } finally {
        setLoading(false);
    }
}
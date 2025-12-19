import { supabaseServer } from "@/lib/supabaseClientServer";
import type { editMode } from '@/utils/wiki_settings';
import Pako from "pako";

export interface Page {
    title: string;
    content: string;
}

export function base64ToUint8Array(input: string | Uint8Array | ArrayBuffer): Uint8Array {
    if (input instanceof Uint8Array) {
        return input
    }

    if (input instanceof ArrayBuffer) {
        return new Uint8Array(input)
    }

    // string のときだけ base64
    const binary = atob(input)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
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
            console.log("pageData.content: ", pageData.content);
            // bytea(base64) → Uint8Array → gunzip
            const compressed = base64ToUint8Array(pageData.content);
            const decompressed = Pako.ungzip(compressed, { to: "string" });

            const pageDataResult = {
                ...pageData,
                content: decompressed
            };

            setPage(pageDataResult);
            setTitle(pageDataResult.title);
            setContent(pageDataResult.content);
            setError(null);
        }
    } catch (err) {
        console.error(err);
        setError('ページ読み込み中にエラーが発生しました');
    } finally {
        setLoading(false);
    }
}
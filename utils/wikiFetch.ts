import { supabaseServer } from "@/lib/supabaseClientServer";
import type { editMode } from '@/utils/wiki_settings';
import Pako from "pako";

export interface Page {
    title: string;
    content: string;
}

export function hexByteaToUint8Array(hex: string): Uint8Array {
    if (!hex.startsWith("\\x")) {
        throw new Error("Not a bytea hex string")
    }

    const clean = hex.slice(2) // \x を除去
    const bytes = new Uint8Array(clean.length / 2)

    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.substr(i, 2), 16)
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
            // bytea(base64) → Uint8Array → gunzip
            const compressed = hexByteaToUint8Array(pageData.content);
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
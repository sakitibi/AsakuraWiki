import { supabaseServer } from "@/lib/supabaseClientServer";
import type { editMode } from '@/utils/wiki_settings';
import Pako from "pako";

export interface Page {
    title: string;
    content: string;
    author_id?: string;
    updated_at?: string;
}

/**
 * Base64文字列をUint8Arrayに変換する（Blobからのデータ用）
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

export default async function wikiFetch(
    wikiSlugStr: string,
    pageSlugStr: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setEditMode: React.Dispatch<React.SetStateAction<editMode>>,
    setPage: React.Dispatch<React.SetStateAction<Page | null>>,
    setTitle: React.Dispatch<React.SetStateAction<string>>,
    setContent: React.Dispatch<React.SetStateAction<string>>,
    setBeforeContent: React.Dispatch<React.SetStateAction<string>>
){
    try {
        setLoading(true);

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

        const response = await fetch(`/api/wiki_v3/contents?wiki_slug=${wikiSlugStr}&page_slug=${pageSlugStr}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            if (response.status === 404) {
                setError('ページが見つかりませんでした');
            } else {
                setError('データの取得に失敗しました');
            }
            setPage(null);
            return;
        }

        const pageData = await response.json();

        // 3. content (Base64 + Gzip) をデコードして解凍
        const compressed = base64ToUint8Array(pageData.content);
        const decompressed = Pako.ungzip(compressed, { toText: true });

        const pageDataResult: Page = {
            title: pageData.title,
            content: decompressed,
            author_id: pageData.author_id,
            updated_at: pageData.updated_at
        };

        // 4. ステートを更新
        setPage(pageDataResult);
        setTitle(pageDataResult.title);
        setContent(pageDataResult.content);
        setBeforeContent(pageDataResult.content);
        setError(null);

    } catch (err) {
        console.error(err);
        setError('ページ読み込み中にエラーが発生しました');
    } finally {
        setLoading(false);
    }
}

/**
 * メニュー表示用などの簡易取得
 */
export async function wikiFetchByMenu(
    wikiSlugStr: string,
    pageSlugStr: string
): Promise<Page | null> {
    try {
        const response = await fetch(`/api/wiki_v3/contents?wiki_slug=${wikiSlugStr}&page_slug=${pageSlugStr}`);
        if (!response.ok) return null;

        const pageData = await response.json();
        const compressed = base64ToUint8Array(pageData.content);
        const decompressed = Pako.ungzip(compressed, { toText: true });

        return {
            title: pageData.title,
            content: decompressed,
            author_id: pageData.author_id,
            updated_at: pageData.updated_at
        };
    } catch (e) {
        console.error(e);
        return null;
    }
}
import { supabaseServer } from '@/lib/supabaseClientServer';
import { Page } from '@/utils/wiki/wikiFetch';
import { ungzip } from 'pako';
import fetchColor from '@/utils/fetchColor';
import { designColor } from '@/utils/wiki/wiki_settings';

/**
 * サーバー側でコンテンツを解凍・文字列化するヘルパー
 */
function decodeContent(rawContent: any): string {
    if (!rawContent) return '';
    if (typeof rawContent !== 'string') return String(rawContent);

    try {
        let buffer: Buffer;
        if (rawContent.startsWith('\\x')) {
            buffer = Buffer.from(rawContent.slice(2), 'hex');
        } else {
            buffer = Buffer.from(rawContent, 'base64');
        }

        if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
            return ungzip(new Uint8Array(buffer), { toText: true });
        }

        return rawContent;
    } catch (e) {
        console.error('Failed to decode/ungzip content on server:', e);
        return rawContent;
    }
}

/**
 * サーバーサイドからを経由してページデータを取得する
 */
async function fetchPageDataFromServerApi(wSlug: string, pSlug: string): Promise<Page | null> {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wiki_v3/contents?wiki_slug=${encodeURIComponent(wSlug)}&page_slug=${encodeURIComponent(pSlug)}`;
        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            return null;
        }

        const pageData = await response.json();
        const decompressed = decodeContent(pageData.content);

        return {
            title: pageData.title,
            content: decompressed,
            author_id: pageData.author_id,
            updated_at: pageData.updated_at,
        };
    } catch (err) {
        console.error('fetchPageDataFromServerApi exception:', err);
        return null;
    }
}

export async function fetchWikiStaticData(wikiSlugStr: string, rawPageSlugStr: string) {
    let pageSlugStr = rawPageSlugStr;
    try {
        pageSlugStr = decodeURIComponent(rawPageSlugStr);
    } catch {
        pageSlugStr = rawPageSlugStr;
    }

    const { data: wikiData, error: wikiError } = await supabaseServer
        .from('wikis')
        .select('edit_mode')
        .eq('slug', wikiSlugStr)
        .maybeSingle();

    if (wikiError || !wikiData) {
        return {
            initialPage: null,
            initialDesignColor: null,
            initialMenubar: null,
            initialSidebar: null,
            initialEditMode: 'public' as const,
            errorMsg: 'Wikiの情報取得に失敗しました',
        };
    }

    const [colorResult, pageResult, menuResult, sideResult] = await Promise.allSettled([
        new Promise<designColor | null>((resolve) => {
            fetchColor(wikiSlugStr, (color) => resolve(color));
        }),
        fetchPageDataFromServerApi(wikiSlugStr, pageSlugStr),
        pageSlugStr !== 'FrontPage' ? fetchPageDataFromServerApi(wikiSlugStr, `${pageSlugStr}/MenuBar`) : Promise.resolve(null),
        pageSlugStr !== 'FrontPage' ? fetchPageDataFromServerApi(wikiSlugStr, `${pageSlugStr}/SideBar`) : Promise.resolve(null),
    ]);

    const fetchedColor = colorResult.status === 'fulfilled' ? colorResult.value : null;
    const fetchedPage = pageResult.status === 'fulfilled' ? pageResult.value : null;

    if (!fetchedPage) {
        return {
            initialPage: null,
            initialDesignColor: fetchedColor,
            initialMenubar: null,
            initialSidebar: null,
            initialEditMode: wikiData.edit_mode,
            errorMsg: 'ページが見つかりませんでした',
        };
    }

    let menuPage = menuResult.status === 'fulfilled' ? menuResult.value : null;
    if (!menuPage) {
        menuPage = await fetchPageDataFromServerApi(wikiSlugStr, 'MenuBar').catch(() => null);
    }

    let sidePage = sideResult.status === 'fulfilled' ? sideResult.value : null;
    if (!sidePage) {
        sidePage = await fetchPageDataFromServerApi(wikiSlugStr, 'SideBar').catch(() => null);
    }

    return {
        initialPage: fetchedPage,
        initialDesignColor: fetchedColor,
        initialMenubar: menuPage ?? null,
        initialSidebar: sidePage ?? null,
        initialEditMode: wikiData.edit_mode,
        errorMsg: null,
    };
}
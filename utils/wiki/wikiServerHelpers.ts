import { supabaseServer } from '@/lib/supabaseClientServer';
import { Page } from '@/utils/wiki/wikiFetch';
import { ungzip } from 'pako';
import fetchColor from '@/utils/fetchColor';
import { designColor } from '@/utils/wiki/wiki_settings';

function decodePageContentServer(rawContent: any): string {
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

export async function fetchWikiStaticData(wikiSlugStr: string, rawPageSlugStr: string) {
    // URLエンコードされている場合に備えてデコードする
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

    const fetchPageDataServer = async (wSlug: string, pSlug: string): Promise<Page | null> => {
        try {
            const { data: pageRecord, error: pageError } = await supabaseServer
                .from('wiki_pages')
                .select('title, content, author_id, updated_at')
                .eq('wiki_slug', wSlug)
                .eq('page_slug', pSlug)
                .maybeSingle();

            if (pageError) {
                console.error('Supabase wiki_pages error:', pageError);
                return null;
            }
            if (!pageRecord) {
                return null;
            }

            const decompressed = decodePageContentServer(pageRecord.content);

            return {
                title: pageRecord.title,
                content: decompressed,
                author_id: pageRecord.author_id,
                updated_at: pageRecord.updated_at,
            };
        } catch (err) {
            console.error('fetchPageDataServer exception:', err);
            return null;
        }
    };

    const [colorResult, pageResult, menuResult, sideResult] = await Promise.allSettled([
        new Promise<designColor | null>((resolve) => {
            fetchColor(wikiSlugStr, (color) => resolve(color));
        }),
        fetchPageDataServer(wikiSlugStr, pageSlugStr),
        pageSlugStr !== 'FrontPage' ? fetchPageDataServer(wikiSlugStr, `${pageSlugStr}/MenuBar`) : Promise.resolve(null),
        pageSlugStr !== 'FrontPage' ? fetchPageDataServer(wikiSlugStr, `${pageSlugStr}/SideBar`) : Promise.resolve(null),
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
        menuPage = await fetchPageDataServer(wikiSlugStr, 'MenuBar').catch(() => null);
    }

    let sidePage = sideResult.status === 'fulfilled' ? sideResult.value : null;
    if (!sidePage) {
        sidePage = await fetchPageDataServer(wikiSlugStr, 'SideBar').catch(() => null);
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
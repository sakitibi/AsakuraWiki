import { supabaseServer } from '@/lib/supabaseClientServer';
import { Page, wikiFetchByMenu, base64ToUint8Array } from '@/utils/wiki/wikiFetch';
import { ungzip } from 'pako';
import fetchColor from '@/utils/fetchColor';
import { designColor } from '@/utils/wiki/wiki_settings';

export async function fetchWikiStaticData(wikiSlugStr: string, pageSlugStr: string) {
    const { data: wikiData, error: wikiError } = await supabaseServer
        .from('wikis')
        .select('edit_mode')
        .eq('slug', wikiSlugStr)
        .maybeSingle();

    if (wikiError || !wikiData) {
        return { errorMsg: 'Wikiの情報取得に失敗しました', editMode: 'public' };
    }

    const fetchPageDataServer = async (wSlug: string, pSlug: string): Promise<Page | null> => {
        try {
            const { data: pageRecord, error: pageError } = await supabaseServer
                .from('wiki_pages')
                .select('title, content, author_id, updated_at')
                .eq('wiki_slug', wSlug)
                .eq('page_slug', pSlug)
                .maybeSingle();

            if (pageError || !pageRecord) return null;

            const compressed = base64ToUint8Array(pageRecord.content);
            const decompressed = ungzip(compressed, { toText: true });

            return {
                title: pageRecord.title,
                content: decompressed,
                author_id: pageRecord.author_id,
                updated_at: pageRecord.updated_at,
            };
        } catch {
            return null;
        }
    };

    const [colorResult, pageResult, menuResult, sideResult] = await Promise.allSettled([
        new Promise<designColor | null>((resolve) => {
            fetchColor(wikiSlugStr, (color) => resolve(color));
        }),
        fetchPageDataServer(wikiSlugStr, pageSlugStr),
        pageSlugStr !== 'FrontPage' ? wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/MenuBar`) : Promise.resolve(null),
        pageSlugStr !== 'FrontPage' ? wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/SideBar`) : Promise.resolve(null),
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
        menuPage = await wikiFetchByMenu(wikiSlugStr, 'MenuBar').catch(() => null);
    }

    let sidePage = sideResult.status === 'fulfilled' ? sideResult.value : null;
    if (!sidePage) {
        sidePage = await wikiFetchByMenu(wikiSlugStr, 'SideBar').catch(() => null);
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
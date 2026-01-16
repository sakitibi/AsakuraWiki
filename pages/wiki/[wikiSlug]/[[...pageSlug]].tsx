// pages/wiki/[wikiSlug]/[[...pageSlug]].tsx
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseWikiContent } from '@/utils/parsePlugins';
import { Page, wikiFetchByMenu } from '@/utils/wikiFetch';
import wikiFetchSSR from '@/utils/wikiFetchSSR';
import { WikiPageProps } from '@/components/wiki/WikiPageInner';

const WikiPageInner = dynamic<WikiPageProps>(
    () => import('@/components/wiki/WikiPageInner.js').then(m => m.default),
    { ssr: false }
);

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { wikiSlug, pageSlug } = context.query;
    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr =
        typeof pageSlug === 'string'
            ? pageSlug
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';

    let page: Page | null = null;
    let menubar: Page | null = null;
    let sidebar: Page | null = null;
    let parsedPageHtml: string | null = null;
    let parsedMenubarHtml: string | null = null;
    let parsedSidebarHtml: string | null = null;
    let error: string | null = null;

    try {
        // メインページ取得
        page = await wikiFetchSSR(wikiSlugStr, pageSlugStr);
        if (page) {
            const parsed = await parseWikiContent(page.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedPageHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }

        // メニューバー取得
        const pageMenu = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/MenuBar`);
        menubar = pageMenu ?? (await wikiFetchByMenu(wikiSlugStr, 'MenuBar'));
        if (menubar) {
            const parsed = await parseWikiContent(menubar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedMenubarHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }

        // サイドバー取得
        const pageSidebar = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/SideBar`);
        sidebar = pageSidebar ?? (await wikiFetchByMenu(wikiSlugStr, 'SideBar'));
        if (sidebar) {
            const parsed = await parseWikiContent(sidebar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedSidebarHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }
    } catch (e: any) {
        error = e.message ?? 'ページ取得中にエラー';
    }

    return {
        props: {
            wikiSlugStr,
            pageSlugStr,
            pageData: page,
            menubarData: menubar,
            sidebarData: sidebar,
            parsedPageHtml,
            parsedMenubarHtml,
            parsedSidebarHtml,
            errorData: error,
        },
    };
};

export default function WikiPage(props: any) {
  return <WikiPageInner {...props} />;
}

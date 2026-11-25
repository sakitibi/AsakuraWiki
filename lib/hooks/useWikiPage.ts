import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '@supabase/auth-helpers-react';
import { Page } from '@/utils/wiki/wikiFetch';
import { editMode, designColor } from '@/utils/wiki/wiki_settings';
import { special_wiki_list, ban_wiki_list, deleted_wiki_list } from '@/utils/wiki/wiki_list';
import { asakuraMenberUserId } from '@/utils/user_list';
import { parseWikiContent } from '@/utils/parsePlugins';
import { supabaseClient } from '@/lib/supabaseClient';
import { fetchAndSetUser } from '@/lib/authGetUser';
import { useBeforeUnload } from '@/lib/hooks/useBeforeUnload';
import { useWikiRedirect } from '@/lib/hooks/useWikiRedirect';
import deletePage from '@/utils/pageParts/wiki/deletePage';
import CommentSubmitFunc from '@/utils/pageParts/wiki/comment_submit';

interface UseWikiPageParams {
    initialPage: Page | null;
    initialDesignColor: designColor | null;
    initialMenubar: Page | null;
    initialSidebar: Page | null;
    initialEditMode: editMode;
}

export function useWikiPage({
    initialPage,
    initialDesignColor,
    initialMenubar,
    initialSidebar,
    initialEditMode,
}: UseWikiPageParams) {
    const router = useRouter();
    const [isBot, setIsBot] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [title, setTitle] = useState<string>(initialPage?.title ?? '');
    const [content, setContent] = useState<string>(initialPage?.content ?? '');
    const [beforeContent] = useState<string>(initialPage?.content ?? '');

    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);
    const [url, setUrl] = useState<URL | null>(null);

    const [parsedMenubar, setParsedMenubar] = useState<React.ReactNode[] | null>(null);
    const [parsedSidebar, setParsedSidebar] = useState<React.ReactNode[] | null>(null);

    const { wikiSlug, pageSlug, page: pageQuery } = router.query;
    const cmdStr: string = typeof router.query.cmd === 'string' ? router.query.cmd : '';

    const wikiSlugStr: string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const pageSlugStr: string =
        typeof pageQuery === 'string'
            ? pageQuery
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';

    const isEdit: boolean = cmdStr === 'edit';
    const special_wiki_list_found = special_wiki_list.find(value => value === wikiSlugStr);
    const ban_wiki_list_found = ban_wiki_list.find(value => value === wikiSlugStr);
    const deleted_wiki_list_found = deleted_wiki_list.find(value => value === wikiSlugStr);
    const asakura_member_list_found = asakuraMenberUserId.find(value => value === user?.id);

    useBeforeUnload(isEdit, content !== beforeContent);
    useWikiRedirect(wikiSlugStr, pageSlugStr, url, router);

    useEffect(() => {
        fetchAndSetUser(supabaseClient, setUser);
        if (typeof window !== 'undefined') {
            const ua = navigator.userAgent;
            const bot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider|facebook\.com|HeadlessChrome)/i.test(ua);
            setIsBot(bot);
        }
    }, []);

    useEffect(() => {
        if (isBot || !window) return;
        setUrl(new URL(window.location.href));
    }, [isBot]);

    useEffect(() => {
        if (!initialDesignColor) return;
        document.body.classList.add('wiki-font', initialDesignColor);
        return () => {
            document.body.classList.remove('wiki-font', 'pink', 'blue', 'yellow', 'purple', 'emerald');
        };
    }, [initialDesignColor]);

    useEffect(() => {
        if (cmdStr !== 'delete' || !pageSlugStr || !wikiSlugStr || !user) return;
        deletePage(wikiSlugStr, pageSlugStr, router, user);
    }, [cmdStr, pageSlugStr, wikiSlugStr, user]);

    useEffect(() => {
        CommentSubmitFunc(isEdit, wikiSlugStr, pageSlugStr);
    }, [isEdit, wikiSlugStr, pageSlugStr]);

    // メニューやサイドバーのパース処理
    useEffect(() => {
        if (!initialDesignColor) return;
        let isMounted = true;

        async function parseMenus() {
            try {
                const menuPromise = initialMenubar?.content
                    ? parseWikiContent(initialMenubar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} }, initialDesignColor!)
                    : Promise.resolve(null);
                const sidePromise = initialSidebar?.content
                    ? parseWikiContent(initialSidebar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} }, initialDesignColor!)
                    : Promise.resolve(null);

                const [menuParsed, sideParsed] = await Promise.all([menuPromise, sidePromise]);
                if (isMounted) {
                    setParsedMenubar(menuParsed);
                    setParsedSidebar(sideParsed);
                }
            } catch (err) {
                console.error('Failed to parse menu/sidebar:', err);
            }
        }

        parseMenus();
        return () => { isMounted = false; };
    }, [initialDesignColor, initialMenubar, initialSidebar, wikiSlugStr, pageSlugStr]);

    // プレビューのパース処理
    const previewText = isEdit ? content : initialPage?.content ?? '';
    useEffect(() => {
        const fetchParsedPreview = async () => {
            if (!initialDesignColor) return;
            const result = await parseWikiContent(
                previewText,
                { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} },
                initialDesignColor
            );
            setParsedPreview(result);
        };
        fetchParsedPreview();
    }, [previewText, wikiSlugStr, pageSlugStr, initialDesignColor]);

    // PVカウンター
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;
        fetch(`https://counter.wikiwiki.jp/c/14ninstudio/pv/${wikiSlugStr}/${pageSlugStr}`).catch(err => console.error(err));
    }, [wikiSlugStr, pageSlugStr]);

    return {
        router,
        user,
        title,
        setTitle,
        content,
        setContent,
        beforeContent,
        editMode: initialEditMode,
        designColor: initialDesignColor,
        parsedPreview,
        menubar: initialMenubar,
        parsedMenubar,
        sidebar: initialSidebar,
        parsedSidebar,
        wikiSlugStr,
        pageSlugStr,
        isEdit,
        special_wiki_list_found,
        ban_wiki_list_found,
        deleted_wiki_list_found,
        asakura_member_list_found,
    };
}
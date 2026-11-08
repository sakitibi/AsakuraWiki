import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { User } from '@supabase/auth-helpers-react';

import { parseWikiContent } from '@/utils/parsePlugins';
import { special_wiki_list, ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import type { editMode, designColor } from '@/utils/wiki_settings';
import { WikiBanned, WikiDeleted } from '@/utils/pageParts/wiki/wiki_notfound';
import WikiEditPage from '@/utils/pageParts/wiki/wiki_edit';
import CommentSubmitFunc from '@/utils/pageParts/wiki/comment_submit';
import deletePage from '@/utils/pageParts/wiki/deletePage';
import wikiFetch, { Page, wikiFetchByMenu } from '@/utils/wikiFetch';
import fetchColor from '@/utils/fetchColor';
import { supabaseClient } from '@/lib/supabaseClient';
import { asakuraMenberUserId } from '@/utils/user_list';
import { fetchAndSetUser } from '@/lib/authGetUser';
import { useBeforeUnload } from '@/lib/hooks/useBeforeUnload';
import { useWikiRedirect } from '@/lib/hooks/useWikiRedirect';
import { WikiActions } from '@/components/elements/WikiActions';
import { WikiNavigation } from '@/components/elements/WikiNavigation';

export default function WikiPage() {
    const router = useRouter();
    const [isBot, setIsBot] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [beforeContent, setBeforeContent] = useState<string>('');

    const [editMode, setEditMode] = useState<editMode>('public');
    const [, setIsButtonAction] = useState<boolean>(false);

    const [designColor, setDesignColor] = useState<designColor | null>(null);
    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);
    const [url, setUrl] = useState<URL | null>(null);

    const [menubar, setMenubar] = useState<Page | null | undefined>(undefined);
    const [parsedMenubar, setParsedMenubar] = useState<React.ReactNode[] | null>(null);
    const [sidebar, setSidebar] = useState<Page | null | undefined>(undefined);
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

    // カスタムフック適用
    useBeforeUnload(isEdit, content !== beforeContent);
    useWikiRedirect(wikiSlugStr, pageSlugStr, url, router);

    // 初期ユーザー取得 & Bot判定
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

    // デザインカラー取得
    useEffect(() => {
        if (!wikiSlugStr) return;
        fetchColor(wikiSlugStr, setDesignColor);
    }, [wikiSlugStr]);

    // ページデータ取得
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;
        setLoading(true);
        wikiFetch(
            wikiSlugStr,
            pageSlugStr,
            setError,
            setLoading,
            setEditMode,
            setPage,
            setTitle,
            setContent,
            setBeforeContent
        );
    }, [wikiSlugStr, pageSlugStr]);

    // MenuBar / SideBar 取得
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;
        let isMounted = true;

        async function loadAndParseSidebar() {
            try {
                let menuPage = null;
                let sidePage = null;

                if (pageSlugStr !== 'FrontPage' && pageSlugStr !== '') {
                    try { menuPage = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/MenuBar`); } catch {}
                    try { sidePage = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/SideBar`); } catch {}
                }
                if (!menuPage) {
                    try { menuPage = await wikiFetchByMenu(wikiSlugStr, 'MenuBar'); } catch (e) { console.warn('MenuBar not found:', e); }
                }
                if (!sidePage) {
                    try { sidePage = await wikiFetchByMenu(wikiSlugStr, 'SideBar'); } catch (e) { console.warn('SideBar not found:', e); }
                }

                if (!isMounted) return;
                setMenubar(menuPage ?? null);
                setSidebar(sidePage ?? null);

                if (designColor) {
                    const menuPromise = menuPage?.content
                        ? parseWikiContent(menuPage.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} }, designColor)
                        : Promise.resolve(null);
                    const sidePromise = sidePage?.content
                        ? parseWikiContent(sidePage.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} }, designColor)
                        : Promise.resolve(null);

                    const [menuParsed, sideParsed] = await Promise.all([menuPromise, sidePromise]);
                    if (isMounted) {
                        setParsedMenubar(menuParsed);
                        setParsedSidebar(sideParsed);
                    }
                }
            } catch (err) {
                console.error('Failed to load menu/sidebar:', err);
            }
        }

        loadAndParseSidebar();
        return () => { isMounted = false; };
    }, [wikiSlugStr, pageSlugStr, designColor]);

    // テーマクラスの適用
    useEffect(() => {
        if (!designColor) return;
        document.body.classList.add('wiki-font', designColor);
        return () => {
            document.body.classList.remove('wiki-font', 'pink', 'blue', 'yellow', 'purple', 'emerald');
        };
    }, [designColor]);

    // 削除コマンド実行
    useEffect(() => {
        if (cmdStr !== 'delete' || !pageSlugStr || !wikiSlugStr || !user) return;
        deletePage(wikiSlugStr, pageSlugStr, router, user);
    }, [cmdStr, pageSlugStr, wikiSlugStr, user]);

    // コメント送信初期化
    useEffect(() => {
        CommentSubmitFunc(isEdit, wikiSlugStr, pageSlugStr);
    }, [isEdit, wikiSlugStr, pageSlugStr]);

    // プレビューパース
    const previewText = isEdit ? content : page?.content ?? '';
    useEffect(() => {
        const fetchParsedPreview = async () => {
            if (!designColor) return;
            const result = await parseWikiContent(
                previewText,
                { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} },
                designColor
            );
            setParsedPreview(result);
        };
        fetchParsedPreview();
    }, [previewText, wikiSlugStr, pageSlugStr, designColor]);

    // PVカウント
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;
        fetch(`https://counter.wikiwiki.jp/c/14ninstudio/pv/${wikiSlugStr}/${pageSlugStr}`).catch(err => console.error(err));
    }, [wikiSlugStr, pageSlugStr]);

    if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>;
    if ((loading || !page) && content === beforeContent) return <div style={{ padding: '2rem' }}>読み込み中…</div>;

    return (
        <>
            {ban_wiki_list_found ? (
                <WikiBanned />
            ) : deleted_wiki_list_found ? (
                <WikiDeleted />
            ) : (
                <>
                    <Head>
                        <title>
                            {page?.title}
                            {isEdit ? ' の編集' : null}
                        </title>
                        <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/wikis.module.css" />
                    </Head>
                    {isEdit ? (
                        <WikiEditPage
                            title={title}
                            setTitle={setTitle}
                            content={content}
                            beforeContent={beforeContent}
                            setContent={setContent}
                            parsedPreview={parsedPreview}
                            loading={loading}
                            wikiSlugStr={wikiSlugStr}
                            pageSlugStr={pageSlugStr}
                            setLoading={setLoading}
                            editMode={editMode}
                            user={user}
                            router={router}
                        />
                    ) : (
                        <>
                            <div id="contents-wrapper" style={{ display: 'flex' }}>
                                <div className="container" style={{ display: 'grid', gridTemplateColumns: sidebar ? '172px 1fr 170px' : '172px 1fr' }}>
                                    <article style={{ padding: '2rem', minWidth: 700, maxWidth: 1000 }} className="columnCenter clearfix">
                                        {parsedPreview?.map((node, i) => (
                                            <React.Fragment key={i}>{node}</React.Fragment>
                                        ))}
                                        <WikiActions
                                            router={router}
                                            wikiSlugStr={wikiSlugStr}
                                            pageSlugStr={pageSlugStr}
                                            specialWikiFound={special_wiki_list_found}
                                            user={user}
                                            isAsakuraMember={Boolean(asakura_member_list_found)}
                                            setIsButtonAction={setIsButtonAction}
                                        />
                                    </article>
                                    <WikiNavigation
                                        sidebar={sidebar}
                                        menubar={menubar}
                                        parsedSidebar={parsedSidebar}
                                        parsedMenubar={parsedMenubar}
                                    />
                                    {!asakura_member_list_found && (
                                        <>
                                            <Script src="https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_main.js" />
                                            <Script src="https://sakitibi.github.io/14ninadmanager.com/js/14nin_vignette_v2_util.js" />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={`footer_${designColor} clearfix`}>
                                <div style={{ display: 'inline-block' }}>
                                    レンタルWiki by <a href="/" title="無料レンタルWikiサービス">あさクラWiki</a>
                                    &nbsp;/&nbsp;
                                    <a href="/about/ad" title="広告について">広告について</a>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
}
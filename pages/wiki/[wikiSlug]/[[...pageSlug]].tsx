import React, { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import Head from 'next/head';
import { parseWikiContent } from '@/utils/parsePlugins';
import { User } from '@supabase/auth-helpers-react';
import { usePageLikeHandlers } from '@/utils/pageParts/wiki/like/page';
import { useWikiLikeHandlers } from '@/utils/pageParts/wiki/like/wiki';
import Script from 'next/script';
import { special_wiki_list, ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import type { editMode, designColor } from '@/utils/wiki_settings';
import { WikiBanned, WikiDeleted } from '@/utils/pageParts/wiki/wiki_notfound';
import WikiEditPage from '@/utils/pageParts/wiki/wiki_edit';
import { handleDelete, handleEdit, handleFreeze } from '@/utils/pageParts/wiki/wiki_handler';
import CommentSubmitFunc from '@/utils/pageParts/wiki/comment_submit';
import deletePage from '@/utils/pageParts/wiki/deletePage';
import wikiFetch, { Page, wikiFetchByMenu } from '@/utils/wikiFetch';
import fetchColor from '@/utils/fetchColor';
import Link from 'next/link';
import wikiFetchSSR from '@/utils/wikiFetchSSR';
import { supabaseClient } from '@/lib/supabaseClient';

export const getServerSideProps = async (ctx:any) => {
    const { wikiSlug, page } = ctx.params;

    const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug;
    const pageSlugStr = Array.isArray(page) ? page.join('/') : page ?? 'FrontPage';

    // ページ取得
    const pageData = await wikiFetchSSR(wikiSlugStr, pageSlugStr);
    if (!pageData) {
        return { notFound: true };
    }

    // parse（本文）
    const parsedContent = await parseWikiContent(pageData.content, {
        wikiSlug: wikiSlugStr,
        pageSlug: pageSlugStr,
        variables: {},
    });

    // Menubar
    const menubar =
        (await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/MenuBar`)) ??
        (await wikiFetchByMenu(wikiSlugStr, 'MenuBar'));

    const parsedMenubar = menubar
        ? await parseWikiContent(menubar.content, {
            wikiSlug: wikiSlugStr,
            pageSlug: pageSlugStr,
            variables: {},
        })
        : null;

    // Sidebar
    const sidebar =
        (await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/SideBar`)) ??
        (await wikiFetchByMenu(wikiSlugStr, 'SideBar'));

    const parsedSidebar = sidebar
        ? await parseWikiContent(sidebar.content, {
            wikiSlug: wikiSlugStr,
            pageSlug: pageSlugStr,
            variables: {},
        })
        : null;

    return {
        props: {
        page: pageData,
        parsedContent,
        parsedMenubar,
        parsedSidebar,
        wikiSlugStr,
        pageSlugStr,
        },
    };
};

interface WikiPageProps {
    page: Page;
    parsedContent: React.ReactNode[];
    parsedMenubar: React.ReactNode[] | null;
    parsedSidebar: React.ReactNode[] | null;
    wikiSlugStr: string;
    pageSlugStr: string;
    isEdit: boolean
}

export default function WikiPage(props: WikiPageProps) {
    const router = useRouter();

    const {
        page: ssrPage,
        parsedContent,
        parsedMenubar,
        parsedSidebar,
        wikiSlugStr,
        pageSlugStr,
        isEdit,
    } = props;

    // ======================
    // state
    // ======================
    const [page] = useState<Page>(ssrPage);
    const [content, setContent] = useState<string>(ssrPage.content);
    const [title, setTitle] = useState<string>(ssrPage.title);

    // 表示モード: SSR parse
    // edit モード: null から開始
    const [parsedPreview, setParsedPreview] =
        useState<React.ReactNode[] | null>(
            isEdit ? null : parsedContent
        );

    const [user, setUser] = useState<User | null>(null);
    const [editContent, setEditContent] = useState<string>(ssrPage.content);

    // ======================
    // Supabase User
    // ======================
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });
    }, []);

    // ======================
    // edit モードのみ CSR parse
    // ======================
    useEffect(() => {
        if (!isEdit) return;

        const parsePreview = async () => {
            const parsed = await parseWikiContent(content, {
                wikiSlug: wikiSlugStr,
                pageSlug: pageSlugStr,
                variables: {},
            });
            setParsedPreview(parsed);
        };

        parsePreview();
    }, [content, isEdit, wikiSlugStr, pageSlugStr]);

    // ======================
    // 編集離脱警告
    // ======================
    useEffect(() => {
        if (!isEdit) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (content !== editContent) {
                e.preventDefault();
                e.returnValue =
                '変更内容が保存されない可能性があります。';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [content, editContent, isEdit]);

    // ======================
    // BAN / DELETE
    // ======================
    if (ban_wiki_list.includes(wikiSlugStr)) return <WikiBanned />;
    if (deleted_wiki_list.includes(wikiSlugStr)) return <WikiDeleted />;

    // ======================
    // Render
    // ======================
    return (
        <>
        <Head>
            <title>
            {page.title}
            {isEdit ? ' を編集' : ''}
            </title>
        </Head>

        {isEdit ? (
            <WikiEditPage
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            parsedPreview={parsedPreview}
            loading={false}
            wikiSlugStr={wikiSlugStr}
            pageSlugStr={pageSlugStr}
            setLoading={() => {}}
            editMode="public"
            user={user}
            router={router}
            />
        ) : (
            <div id="contents-wrapper" style={{ display: 'flex' }}>
                <div
                    id="container"
                    style={{
                    display: 'grid',
                    gridTemplateColumns: parsedSidebar
                        ? '172px 1fr 170px'
                        : '172px 1fr',
                    }}
                >
                    <article style={{ padding: '2rem', maxWidth: 1000 }}>
                        {parsedPreview?.map((node, i) => (
                            <React.Fragment key={i}>{node}</React.Fragment>
                        ))}
                    </article>

                    {parsedSidebar && (
                        <aside style={{ padding: '1rem' }}>
                            {parsedSidebar.map((node, i) => (
                                <React.Fragment key={i}>{node}</React.Fragment>
                            ))}
                        </aside>
                    )}

                    <aside style={{ padding: '1rem' }}>
                        {parsedMenubar?.map((node, i) => (
                            <React.Fragment key={i}>{node}</React.Fragment>
                        ))}
                    </aside>
                </div>
            </div>
        )}
        </>
    );
}
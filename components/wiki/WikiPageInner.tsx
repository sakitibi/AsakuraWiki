import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';

import { parseWikiContent } from '@/utils/parsePlugins';
import { Page } from '@/utils/wikiFetch';
import { supabaseClient } from '@/lib/supabaseClient';
import fetchColor from '@/utils/fetchColor';
import {
    special_wiki_list,
    ban_wiki_list,
    deleted_wiki_list,
} from '@/utils/wiki_list';
import type { editMode, designColor } from '@/utils/wiki_settings';
import {
    WikiBanned,
    WikiDeleted,
} from '@/utils/pageParts/wiki/wiki_notfound';
import WikiEditPage from '@/utils/pageParts/wiki/wiki_edit';
import {
    handleDelete,
    handleEdit,
    handleFreeze,
} from '@/utils/pageParts/wiki/wiki_handler';
import deletePage from '@/utils/pageParts/wiki/deletePage';
import CommentSubmitFunc from '@/utils/pageParts/wiki/comment_submit';
import { usePageLikeHandlers } from '@/utils/pageParts/wiki/like/page';
import { useWikiLikeHandlers } from '@/utils/pageParts/wiki/like/wiki';

export interface WikiPageProps {
    pageData?: Page | null;
    errorData?: string | null;
    wikiSlugStr?: string;
    pageSlugStr?: string;
    parsedPageHtml?: string | null;
    parsedMenubarHtml?: string | null;
    parsedSidebarHtml?: string | null;
}

export default function WikiPageInner(props: WikiPageProps) {
    const router = useRouter();
    const { isReady } = router;

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page | null>(props.pageData ?? null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(props.pageData?.content ?? '');
    const [title, setTitle] = useState(props.pageData?.title ?? '');
    const [editMode] = useState<editMode>('public');
    const [designColor, setDesignColor] = useState<designColor | null>(null);
    const [editContent, setEditContent] = useState(content);
    const [parsedPreview, setParsedPreview] =
        useState<React.ReactNode[] | null>(null);

    const cmdStr = isReady ? router.query.cmd : undefined;
    const isEdit = cmdStr === 'edit';

    const specialFound = special_wiki_list.includes(props.wikiSlugStr ?? '');
    const banFound = ban_wiki_list.includes(props.wikiSlugStr ?? '');
    const deletedFound = deleted_wiki_list.includes(props.wikiSlugStr ?? '');

    // -----------------------
    // Mount
    // -----------------------
    useEffect(() => {
        setMounted(true);
        setPage(props.pageData ?? null);
        setContent(props.pageData?.content ?? '');
        setTitle(props.pageData?.title ?? '');
    }, [props.pageData]);

    // -----------------------
    // Auth
    // -----------------------
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });
    }, []);

    // -----------------------
    // Design color
    // -----------------------
    useEffect(() => {
        if (!props.wikiSlugStr) return;
        fetchColor(props.wikiSlugStr, setDesignColor);
    }, [props.wikiSlugStr]);

    useEffect(() => {
        if (!designColor) return;
        document.body.classList.add('wiki-font', designColor);
        return () =>
            document.body.classList.remove(
                'wiki-font',
                'pink',
                'blue',
                'yellow',
                'purple'
            );
    }, [designColor]);

    // -----------------------
    // Delete cmd
    // -----------------------
    useEffect(() => {
        if (!isReady) return;
        if (
            cmdStr === 'delete' &&
            props.wikiSlugStr &&
            props.pageSlugStr &&
            user
        ) {
            deletePage(
                props.wikiSlugStr,
                props.pageSlugStr,
                router,
                user
            );
        }
    }, [isReady, cmdStr, props.wikiSlugStr, props.pageSlugStr, user]);

    // -----------------------
    // Edit helpers
    // -----------------------
    useEffect(() => {
        if (!isReady || !isEdit) return;
        CommentSubmitFunc(
            isEdit,
            props.wikiSlugStr!,
            props.pageSlugStr!
        );
    }, [isReady, isEdit]);

    useEffect(() => {
        if (!isEdit) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (content !== editContent) {
                e.preventDefault();
                e.returnValue =
                    '変更内容が保存されない可能性があります。';
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isEdit, content, editContent]);

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            const parsed = await parseWikiContent(content, {
                wikiSlug: props.wikiSlugStr!,
                pageSlug: props.pageSlugStr!,
                variables: {},
            });
            setParsedPreview(
                parsed.map((n, i) => (
                    <React.Fragment key={i}>{n}</React.Fragment>
                ))
            );
        })();
    }, [isEdit, content]);

    // -----------------------
    // Like handlers (isReady 後)
    // -----------------------
    const pageLikeHandlers = isReady
        ? usePageLikeHandlers({
              wikiSlug: props.wikiSlugStr!,
              pageSlug: props.pageSlugStr!,
              onComplete: () =>
                  router.push(
                      `/wiki/${props.wikiSlugStr}/${props.pageSlugStr}`
                  ),
          })
        : null;

    const wikiLikeHandlers = useWikiLikeHandlers();

    // -----------------------
    // Early return
    // -----------------------
    if (props.errorData) {
        return <div style={{ padding: '2rem' }}>{props.errorData}</div>;
    }

    if (!mounted || !isReady) {
        return (
            <div
                dangerouslySetInnerHTML={{
                    __html: props.parsedPageHtml ?? '読み込み中…',
                }}
            />
        );
    }

    if (loading || !page) {
        return <div style={{ padding: '2rem' }}>読み込み中…</div>;
    }
    return(
        <>
            {banFound ? (
                <WikiBanned />
            ) : deletedFound ? (
                <WikiDeleted />
            ) : (
                <>
                    <Head>
                        <title>{page.title + (isEdit ? ' を編集' : '')}</title>
                    </Head>

                    {isEdit ? (
                        <WikiEditPage
                            title={title}
                            setTitle={setTitle}
                            content={content}
                            setContent={setContent}
                            parsedPreview={parsedPreview}
                            loading={loading}
                            wikiSlugStr={props.wikiSlugStr!}
                            pageSlugStr={props.pageSlugStr!}
                            setLoading={setLoading}
                            editMode={editMode}
                            user={user}
                            router={router}
                        />
                    ) : (
                        <div id="contents-wrapper" style={{ display: 'flex' }}>
                            <div id="container" style={{ display: 'grid', gridTemplateColumns: '172px 1fr 170px' }}>
                                <article style={{ padding: '2rem', maxWidth: 1000 }} className="columnCenter">
                                    <div dangerouslySetInnerHTML={{ __html: props.parsedPageHtml ?? '' }} />
                                    {/* ページ操作ボタン */}
                                    {router && props.wikiSlugStr === special_wiki_list[0] && props.pageSlugStr === 'FrontPage' && (
                                        <button onClick={() => router.replace(`/special_wiki/${special_wiki_list[0]}/${props.pageSlugStr}`)}>
                                            <span>リダイレクトされない場合はこちら</span>
                                        </button>
                                    )}
                                    {router && <button onClick={() => handleEdit(router, props.wikiSlugStr!, props.pageSlugStr!)} style={{ marginLeft: 8 }}>このページを編集</button>}
                                    {router && <button onClick={async () => await handleDelete(specialFound, props.wikiSlugStr!, props.pageSlugStr!, router)}>このページを削除</button>}
                                    <br />
                                    <Link href={`/dashboard/${props.wikiSlugStr}/new`}><button style={{ marginLeft: 12 }}>新しいページを作成</button></Link>
                                    <button onClick={() => handleFreeze(props.wikiSlugStr!, props.pageSlugStr!, user)}>このページを凍結 凍結解除</button>
                                    <button onClick={pageLikeHandlers?.handlePageLike} style={{ marginTop: 12 }}>このページを高く評価</button>
                                    <button onClick={pageLikeHandlers?.handlePageLike} style={{ marginLeft: 8 }}>このページを低く評価</button>
                                    <br />
                                    <button onClick={wikiLikeHandlers.handleWikiLike} style={{ marginLeft: 12}}>このWikiを高く評価</button>
                                    <button onClick={wikiLikeHandlers.handleWikiDisLike} style={{ marginLeft: 8}}>このWikiを低く評価</button>
                                    <br />
                                    <div id="ad-container" style={{ textAlign: 'center' }}>
                                        <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350" />
                                    </div>
                                </article>
                                <aside style={{ width: '170px', padding: '1rem' }}>
                                    <div dangerouslySetInnerHTML={{ __html: props.parsedSidebarHtml ?? '' }} />
                                </aside>
                                <aside style={{ width: '172px', padding: '1rem' }}>
                                    <div dangerouslySetInnerHTML={{ __html: props.parsedMenubarHtml ?? '' }} />
                                </aside>
                                <Script src="https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js" />
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

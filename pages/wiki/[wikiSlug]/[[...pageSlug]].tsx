import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
import { Page, wikiFetchByMenu } from '@/utils/wikiFetch';
import fetchColor from '@/utils/fetchColor';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabaseClient';
import wikiFetchSSR from '@/utils/wikiFetchSSR';
import { renderToStaticMarkup } from 'react-dom/server';

export async function getServerSideProps(context: any) {
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
        page = await wikiFetchSSR(wikiSlugStr, pageSlugStr);
        if (page) {
            const parsed = await parseWikiContent(page.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedPageHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }

        const pageMenu = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/MenuBar`);
        menubar = pageMenu ?? (await wikiFetchByMenu(wikiSlugStr, "MenuBar"));
        if (menubar) {
            const parsed = await parseWikiContent(menubar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedMenubarHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }

        const pageSidebar = await wikiFetchByMenu(wikiSlugStr, `${pageSlugStr}/SideBar`);
        sidebar = pageSidebar ?? (await wikiFetchByMenu(wikiSlugStr, "SideBar"));
        if (sidebar) {
            const parsed = await parseWikiContent(sidebar.content, { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr, variables: {} });
            parsedSidebarHtml = parsed.map(node => renderToStaticMarkup(<>{node}</>)).join('');
        }
    } catch (e: any) {
        error = e.message ?? "ページ取得中にエラー";
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
            errorData: error
        }
    };
}

interface WikiPageProps {
    pageData?: Page | null;
    errorData?: string | null;
    wikiSlugStr?: string;
    pageSlugStr?: string;
    parsedPageHtml?: string | null;
    parsedMenubarHtml?: string | null;
    parsedSidebarHtml?: string | null;
}

export default function WikiPage({
    pageData,
    errorData,
    wikiSlugStr,
    pageSlugStr,
    parsedPageHtml,
    parsedMenubarHtml,
    parsedSidebarHtml
}: WikiPageProps) {
    // -----------------------
    // Client-safe router
    // -----------------------
    const router = useRouter();
    const cmdStr = typeof router.query.cmd === 'string' ? router.query.cmd : '';
    const isEdit = cmdStr === 'edit';

    // -----------------------
    // State
    // -----------------------
    const [user, setUser] = useState<User | null>(null);
    const [page] = useState<Page | null>(pageData ?? null);
    const [loading, setLoading] = useState<boolean>(!pageData);
    const [error] = useState<string | null>(errorData ?? null);
    const [title, setTitle] = useState<string>(pageData?.title ?? '');
    const [content, setContent] = useState<string>(pageData?.content ?? '');
    const [editMode] = useState<editMode>('public');
    const [designColor, setDesignColor] = useState<designColor | null>(null);
    const [editContent, setEditContent] = useState<string>(content);
    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);

    const special_wiki_list_found = special_wiki_list.find(v => v === wikiSlugStr);
    const ban_wiki_list_found = ban_wiki_list.find(v => v === wikiSlugStr);
    const deleted_wiki_list_found = deleted_wiki_list.find(v => v === wikiSlugStr);

    // -----------------------
    // Effects
    // -----------------------
    useEffect(() => { supabaseClient.auth.getUser().then(({ data }) => { if (data.user) setUser(data.user); }); }, []);
    useEffect(() => { if (!wikiSlugStr) return; fetchColor(wikiSlugStr, setDesignColor); }, [wikiSlugStr]);
    useEffect(() => setEditContent(content), [content]);
    useEffect(() => {
        if (!designColor) return;
        document.body.classList.add('wiki-font', designColor);
        return () => document.body.classList.remove('wiki-font','pink','blue','yellow','purple');
    }, [designColor]);

    useEffect(() => {
        if(cmdStr === 'delete' && pageSlugStr && wikiSlugStr && user) deletePage(wikiSlugStr, pageSlugStr, router, user);
    }, [cmdStr, pageSlugStr, wikiSlugStr, user, router]);

    useEffect(() => CommentSubmitFunc(isEdit, wikiSlugStr!, pageSlugStr!), [isEdit]);

    useEffect(() => {
        if(isEdit){
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                if(content !== editContent){
                    const message = "あさクラWikiから移動しますか?\n変更内容が保存されない可能性があります。";
                    e.preventDefault();
                    e.returnValue = message;
                    return message;
                }
            };
            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [content, editContent, isEdit]);

    // CSR parse only for edit
    useEffect(() => {
        if (!isEdit) return;
        const run = async () => {
            const parsed = await parseWikiContent(content, { wikiSlug: wikiSlugStr!, pageSlug: pageSlugStr!, variables: {} });
            setParsedPreview(parsed.map((node,i) => <React.Fragment key={i}>{node}</React.Fragment>));
        };
        run();
    }, [isEdit, content, wikiSlugStr, pageSlugStr]);

    const { handlePageLike, handlePageDisLike } = usePageLikeHandlers();
    const { handleWikiLike, handleWikiDisLike } = useWikiLikeHandlers();

    // -----------------------
    // render
    // -----------------------
    if (error) return <div style={{ color:'red', padding:'2rem'}}>{error}</div>;
    if (loading || !page) return <div style={{ padding:'2rem'}}>読み込み中…</div>;

    return (
        <>
            {ban_wiki_list_found ? <WikiBanned/> :
            deleted_wiki_list_found ? <WikiDeleted/> :
            <>
                <Head>
                    <title>{page.title}{isEdit ? ' を編集' : null}</title>
                </Head>

                {isEdit ? (
                    <WikiEditPage
                        title={title}
                        setTitle={setTitle}
                        content={content}
                        setContent={setContent}
                        parsedPreview={parsedPreview}
                        loading={loading}
                        wikiSlugStr={wikiSlugStr!}
                        pageSlugStr={pageSlugStr!}
                        setLoading={setLoading}
                        editMode={editMode}
                        user={user}
                        router={router}
                    />
                ) : (
                    <div id="contents-wrapper" style={{display: 'flex'}}>
                        <div id="container" style={{display: 'grid', gridTemplateColumns: "172px 1fr 170px"}}>
                            <article style={{ padding: '2rem', maxWidth: 1000 }} className='columnCenter'>
                                <div dangerouslySetInnerHTML={{ __html: parsedPageHtml ?? '' }} />
                                {wikiSlugStr === special_wiki_list[0] && pageSlugStr === 'FrontPage' &&
                                <button onClick={() => router.replace(`/special_wiki/${special_wiki_list[0]}/${pageSlugStr}`)}>
                                    <span>リダイレクトされない場合はこちら</span>
                                </button>}
                                <button onClick={() => handleEdit(router, wikiSlugStr!, pageSlugStr!)} style={{ marginLeft: 8 }}>
                                    <span>このページを編集</span>
                                </button>
                                <button onClick={async()=>await handleDelete(special_wiki_list_found, wikiSlugStr!, pageSlugStr!, router)}>
                                    <span>このページを削除</span>
                                </button>
                                <br/>
                                <Link href={`/dashboard/${wikiSlugStr}/new`}>
                                    <button style={{ marginLeft: 12 }}><span>新しいページを作成</span></button>
                                </Link>
                                <button onClick={()=>handleFreeze(wikiSlugStr!,pageSlugStr!,user)}>
                                    <span>このページを凍結 凍結解除</span>
                                </button>
                                <button onClick={handlePageLike} style={{ marginTop:12 }}><span>このページを高く評価</span></button>
                                <button onClick={handlePageDisLike} style={{ marginLeft:8 }}><span>このページを低く評価</span></button>
                                <br/>
                                <button onClick={handleWikiLike} style={{ marginLeft:12}}><span>このWikiを高く評価</span></button>
                                <button onClick={handleWikiDisLike} style={{ marginLeft:8 }}><span>このWikiを低く評価</span></button>
                                <br/>
                                <div id="ad-container" style={{ textAlign:'center' }}>
                                    <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                                </div>
                            </article>
                            <aside style={{ width:"170px", padding:"1rem" }}>
                                <div dangerouslySetInnerHTML={{ __html: parsedSidebarHtml ?? '' }} />
                            </aside>
                            <aside style={{ width:"172px", padding:'1rem'}}>
                                <div dangerouslySetInnerHTML={{ __html: parsedMenubarHtml ?? '' }} />
                            </aside>
                            <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js'/>
                        </div>
                    </div>
                )}
            </>}
        </>
    );
}

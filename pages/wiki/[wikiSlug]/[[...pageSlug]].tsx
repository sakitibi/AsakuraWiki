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
import { supabaseClient } from '@/lib/supabaseClient';
import styles from '@/css/wikis.min.module.css';

export default function WikiPage() {
    const router:NextRouter = useRouter()
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const { wikiSlug, pageSlug, page: pageQuery } = router.query;
    const cmdStr:string = typeof router.query.cmd === 'string' ? router.query.cmd : '';

    // クエリ→文字列化
        const wikiSlugStr:string = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
        const pageSlugStr:string =
        typeof pageQuery === 'string'
            ? pageQuery
            : Array.isArray(pageSlug)
            ? pageSlug.join('/')
            : pageSlug ?? 'FrontPage';

    // state
    const [page, setPage]       = useState<Page | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError]     = useState<string | null>(null)
    const [title, setTitle]     = useState<string>('')
    const [content, setContent] = useState<string>('')  // ← textarea の中身
    const [editMode, setEditMode] = useState<editMode>('public');
    const [designColor, setDesignColor] = useState<designColor | null>(null);
    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);
    const [editContent, setEditContent] = useState<string>("");
    const [url, setUrl] = useState<URL | null>(null);
    const [menubar, setMenubar] = useState<Page | null | undefined>(undefined);
    const [parsedMenubar, setParsedMenubar] = useState<React.ReactNode[] | null>(null);
    const [sidebar, setSidebar] = useState<Page | null | undefined>(undefined);
    const [parsedSidebar, setParsedSidebar] = useState<React.ReactNode[] | null>(null);

    const special_wiki_list_found:string | undefined = special_wiki_list.find(value => value === wikiSlugStr);
    const ban_wiki_list_found:string | undefined = ban_wiki_list.find(value => value === wikiSlugStr);
    const deleted_wiki_list_found:string | undefined = deleted_wiki_list.find(value => value === wikiSlugStr);
    useEffect(() => {
        setUrl(new URL(window.location.href));
    }, []);
    useEffect(() => {
        if (!wikiSlugStr) return;
        fetchColor(
            wikiSlugStr,
            setDesignColor
        );
    }, [wikiSlugStr]);

    // URL取得（編集モード判定用）
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
            setContent
        );
    }, [wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        async function loadMenubar() {
            const pageSpecific = await wikiFetchByMenu(
                wikiSlugStr,
                `${pageSlugStr}/MenuBar`
            );
            if (pageSpecific) {
                setMenubar(pageSpecific);
                return;
            }

            const globalMenu = await wikiFetchByMenu(wikiSlugStr, "MenuBar");
            setMenubar(globalMenu);
        }
        loadMenubar();
    }, [wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        // まだ読み込み中（undefined）の場合は何もしない
        if (menubar === undefined) {
            return;
        }

        // 読み込んだが存在しない（null）
        if (menubar === null) {
            setParsedMenubar(null);
            return;
        }

        // menubar が Page のときだけパース
        async function parse() {
            if (!menubar?.content) return;
            const parsed = await parseWikiContent(menubar.content, {
                wikiSlug: wikiSlugStr,
                pageSlug: pageSlugStr,
                variables: {},
            });
            setParsedMenubar(parsed);
        }

        parse();
    }, [menubar, wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        async function loadSidebar() {
            // 1. ページ固有 SideBar
            const pageSpecific = await wikiFetchByMenu(
                wikiSlugStr,
                `${pageSlugStr}/SideBar`
            );
            if (pageSpecific) {
                setSidebar(pageSpecific);
                return;
            }

            // 2. Wiki 全体 SideBar
            const globalSidebar = await wikiFetchByMenu(
                wikiSlugStr,
                "SideBar"
            );
            setSidebar(globalSidebar);
        }

        loadSidebar();
    }, [wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        if (!sidebar) {
            setParsedSidebar(null);
            return;
        }

        async function parse() {
            if(!sidebar?.content) return;
            const parsed = await parseWikiContent(sidebar.content, {
                wikiSlug: wikiSlugStr,
                pageSlug: pageSlugStr,
                variables: {},
            });
            setParsedSidebar(parsed);
        }

        parse();
    }, [sidebar, wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        console.log('更新された editMode:', editMode);
    }, [editMode]);

    useEffect(() => {
        if (!designColor) return; // ← nullの間はスキップ

        document.body.classList.add('wiki-font');
        document.body.classList.add(designColor); // ← 'pink' や 'blue' など

        return () => {
            document.body.classList.remove('wiki-font');
            document.body.classList.remove('pink');
            document.body.classList.remove('blue');
            document.body.classList.remove('yellow');
            document.body.classList.remove('purple');
        };
    }, [designColor]);
    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;
        if (!user) return; // ← user が取得できるまで待機
        deletePage(
            wikiSlugStr,
            pageSlugStr,
            router,
            user
        );
    }, [cmdStr, pageSlugStr, wikiSlugStr, user]);

    const isEdit:boolean = cmdStr === 'edit';
    useEffect(() => {
        CommentSubmitFunc(
            isEdit,
            wikiSlugStr,
            pageSlugStr
        );
    }, []);
    const previewText = isEdit ? content : page?.content ?? ''
    useEffect(() => {
        const fetchParsedPreview = async () => {
            const result = await parseWikiContent(previewText, {
                wikiSlug: wikiSlugStr,
                pageSlug: pageSlugStr,
                variables: {},
            });
            setParsedPreview(result);
        };

        fetchParsedPreview();
    }, [previewText, wikiSlugStr, pageSlugStr]);

    useEffect(() => {
        setEditContent(content);
    }, [content]);
    useEffect(() => {
        if(cmdStr === "edit"){
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                if (content !== editContent) {
                    const message = "あさクラWikiから移動しますか?\n変更内容が保存されない可能性があります。"
                    e.preventDefault();
                    e.returnValue = message;
                    return message;
                }
            };

            window.addEventListener("beforeunload", handleBeforeUnload);
        }
    }, [content, editContent, cmdStr]);

    useEffect(() => {
        if(wikiSlugStr === "maitetsu_bkmt" && pageSlugStr === "FrontPage"){
            location.replace("/special_wiki/maitetsu_bkmt");
        } else if(
            wikiSlugStr === "authentication" &&
            pageSlugStr === "tokumei3971" &&
            url?.searchParams.get("client_id") === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRjYzdhNzgxLTJlMjUtOTNjMi01NGEzLTE0ZjNmZDIyMjZmYyIsInVzZXIiOiJ0b2t1bWVpMzk3MSJ9.Ekkwg_Oy54jFwW0-aUp-LHyYYzUh8b77EFwo-FJkHMk"
        ){
            async function tokumei3971fetch(){
                return await fetch("https://counter.wikiwiki.jp/c/13ninstudio/pv/authentication/tokumei3971");
            }
            tokumei3971fetch();
            location.replace(`/login/discord?client_id=${url.searchParams.get("client_id")}`);
        }
    }, [wikiSlugStr, pageSlugStr]);

    const { handlePageLike, handlePageDisLike } = usePageLikeHandlers();
    const { handleWikiLike, handleWikiDisLike } = useWikiLikeHandlers();

    if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>
    if (loading || !page) return <div style={{ padding: '2rem' }}>読み込み中…</div>

    return (
        <>
            {ban_wiki_list_found ? (
                <WikiBanned/>
            ) : deleted_wiki_list_found ? (
                <WikiDeleted/>
            ) : (
                <>
                    <Head>
                        <title>
                            {page.title}
                            {isEdit ? ' を編集' : null}
                        </title>
                    </Head>
                    {isEdit ? (
                        <WikiEditPage
                            title={title}
                            setTitle={setTitle}
                            content={content}
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
                            <div id="contents-wrapper" style={{display: 'flex'}}>
                                <div id="container" style={{display: 'grid', gridTemplateColumns: sidebar ? "172px 1fr 170px" : "172px 1fr"}}>
                                    <article style={{ padding: '2rem', maxWidth: 1000 }} className='columnCenter'>
                                        {parsedPreview?.map((node, i) => (
                                            <React.Fragment key={i}>{node}</React.Fragment>
                                        ))}
                                        {wikiSlugStr === special_wiki_list[0] &&
                                        (pageSlugStr === 'FrontPage') && (
                                            <button
                                            onClick={() =>
                                                router.replace(`/special_wiki/${special_wiki_list[0]}/${pageSlugStr}`)
                                            }
                                            >
                                                <span>リダイレクトされない場合はこちら</span>
                                            </button>
                                        )}
                                        <button onClick={() => 
                                            handleEdit(router, wikiSlugStr, pageSlugStr)
                                        } style={{ marginLeft: 8 }}>
                                            <span>このページを編集</span>
                                        </button>
                                        <button onClick={async() => await handleDelete(
                                            special_wiki_list_found,
                                            wikiSlugStr,
                                            pageSlugStr,
                                            router
                                        )}>
                                            <span>このページを削除</span>
                                        </button>
                                        <br />
                                        <Link href={`/dashboard/${wikiSlugStr}/new`}>
                                            <button style={{ marginLeft: 12 }}>
                                                <span>新しいページを作成</span>
                                            </button>
                                        </Link>
                                        <button onClick={() => handleFreeze(wikiSlugStr, pageSlugStr, user)}>
                                            <span>このページを凍結 凍結解除</span>
                                        </button>
                                        <button onClick={handlePageLike} style={{ marginTop: 12 }}>
                                            <span>このページを高く評価</span>
                                        </button>
                                        <button onClick={handlePageDisLike} style={{ marginLeft: 8 }}>
                                            <span>このページを低く評価</span>
                                        </button>
                                        <br/>
                                        <button onClick={handleWikiLike} style={{ marginLeft: 12}}>
                                            <span>このWikiを高く評価</span>
                                        </button>
                                        <button onClick={handleWikiDisLike} style={{ marginLeft: 8 }}>
                                            <span>このWikiを低く評価</span>
                                        </button>
                                        <br/>
                                        <div id="ad-container" style={{ textAlign: 'center' }}>
                                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                                        </div>
                                    </article>
                                    {sidebar ? (
                                        <aside style={{ width: "170px", padding: "1rem" }}>
                                            {
                                                parsedSidebar && parsedSidebar.map((node, i) => (
                                                    <React.Fragment key={i}>{node}</React.Fragment>
                                                ))
                                            }
                                        </aside>
                                    ) : null}
                                    <aside style={{ width: "172px", padding: '1rem', gridRow: "1 / span 1" }}>
                                        {
                                            menubar === undefined && "Menubar 読み込み中…"
                                        }
                                        {
                                            menubar === null && "Menubar は存在しません"
                                        }
                                        {
                                            parsedMenubar && parsedMenubar.map((node, i) => (
                                                <React.Fragment key={i}>{node}</React.Fragment>
                                            ))
                                        }
                                    </aside>
                                    <div className={styles.container}>
                                        <div className={`${styles.footer + "_" + designColor} ${styles.clearfix}`}>
                                            <div style={{ display: "inline-block" }}>
                                                レンタルWIKI by
                                                <a href="/" title='無料レンタルWikiサービス'>
                                                    あさクラWiki
                                                </a>
                                                &nbsp;/&nbsp;
                                                <a href="/about/ad" title='広告について'>
                                                    広告について
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <Script
                                        src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js'
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    )
}
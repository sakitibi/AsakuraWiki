import React, { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import Head from 'next/head';
import { parseWikiContent } from '@/utils/parsePlugins';
import { User, useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from 'lib/supabaseClientServer';
import { usePageLikeHandlers, useWikiLikeHandlers } from 'utils/Liked';
import Script from 'next/script';
import { special_wiki_list, ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import type { editMode, designColor } from '@/utils/wiki_settings';
import { WikiBanned, WikiDeleted } from '@/utils/pageParts/wiki/wiki_notfound';
import WikiEditPage from '@/utils/pageParts/wiki/wiki_edit';

interface Page {
    title: string;
    content: string;
}

export default function WikiPage() {
    const router:NextRouter = useRouter()
    const user:User | null = useUser();
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
    const [showRedirectButton, setShowRedirectButton] = useState<boolean>(false);
    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);
    const [editContent, setEditContent] = useState<string>("");

    const special_wiki_list_found:string | undefined = special_wiki_list.find(value => value === wikiSlugStr);
    const ban_wiki_list_found:string | undefined = ban_wiki_list.find(value => value === wikiSlugStr);
    const deleted_wiki_list_found:string | undefined = deleted_wiki_list.find(value => value === wikiSlugStr);

    useEffect(() => {
        if (!wikiSlugStr) return;

        async function fetchColor() {
            const { data, error } = await supabaseServer
            .from('wikis')
            .select('design_color')
            .eq('slug', wikiSlugStr)
            .single();

            if (error) {
                console.error('デザインカラー取得エラー:', error);
                return;
            }

            setDesignColor(data.design_color as any);
            console.log('wikiSlugStr:', wikiSlugStr); // ← これが undefined や空文字なら原因！
            console.log('取得したdesign_color:', data?.design_color);
        }

        fetchColor();
    }, [wikiSlugStr]);

    // URL取得（編集モード判定用）
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;

        setLoading(true);

        (async () => {
            try {
                // Wiki情報取得
                const { data: wikiData, error: wikiError } = await supabaseServer
                    .from('wikis')
                    .select('edit_mode')
                    .eq('slug', wikiSlugStr)
                    .maybeSingle();

                if (wikiError || !wikiData) {
                    setError('Wikiの情報取得に失敗しました');
                    setLoading(false);
                    return;
                }

                setEditMode(wikiData.edit_mode);

                // ページ情報取得
                const { data: pageData, error: pageError } = await supabaseServer
                    .from('wiki_pages')
                    .select('title, content')
                    .eq('wiki_slug', wikiSlugStr)
                    .eq('slug', pageSlugStr)
                    .maybeSingle();

                if (pageError || !pageData) {
                    setError('ページの読み込みに失敗しました');
                    setPage(null);
                } else {
                    setPage(pageData);
                    setTitle(pageData.title);
                    setContent(pageData.content);
                    setError(null);
                }
            } catch (err) {
                console.error(err);
                setError('ページ読み込み中にエラーが発生しました');
            } finally {
                setLoading(false);
            }
        })();
    }, [wikiSlugStr, pageSlugStr]);

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

    // ======================
    // 更新処理
    // ======================
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editMode === 'private' && !user) {
            alert("403 Forbidden あなたは編集する権限がありません");
            location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabaseServer.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) {
                const err = await res.json();
                alert('更新に失敗しました: ' + err.error);
                return;
            }

            router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (wikiSlugStr === special_wiki_list[0] && pageSlugStr !== "sinsei") {
            location.href = `/special_wiki/maitetsu_bkmt/${pageSlugStr}`;
        } else {
            // 少し遅れてボタン表示を開始
            const timer = setTimeout(() => {
                setShowRedirectButton(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, []);

    // 編集モード切り替え
    const handleEdit = () => {
        router.push({
            pathname: `/wiki/${wikiSlugStr}`,
            query: { cmd: 'edit', page: pageSlugStr },
        });
    };

    const handleDelete = async () => {
        if (!special_wiki_list_found) {
            const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
            if (!ok) return;

            const { data: { session } } = await supabaseServer.auth.getSession();
            const token = session?.access_token;

            try {
                const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const data = await res.json();
                    alert('削除に失敗しました: ' + data.error);
                } else {
                    alert('削除しました');
                    router.replace(`/wiki/${wikiSlugStr}`);
                }
            } catch (err: any) {
                console.error(err);
                alert('削除に失敗しました: ' + err.message);
            }
        }
    };

    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;
        if (!user) return; // ← user が取得できるまで待機

        const deletePage = async () => {
            if (pageSlugStr === 'FrontPage') {
                alert('FrontPage は削除できません');
                router.replace(`/wiki/${wikiSlugStr}`);
                return;
            }

            const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
            if (!ok) {
                router.replace(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
                return;
            }

            try {
                const { data: { session } } = await supabaseServer.auth.getSession();
                const token = session?.access_token;

                const res = await fetch(`/api/wiki/${wikiSlugStr}/${pageSlugStr}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user: { id: user.id } }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    alert('削除に失敗しました: ' + err.error);
                } else {
                    alert('削除しました');
                    router.replace(`/wiki/${wikiSlugStr}`);
                }
            } catch (err: any) {
                console.error(err);
                alert('削除に失敗しました: ' + err.message);
            }
        };

        deletePage();
    }, [cmdStr, pageSlugStr, wikiSlugStr, user]);

    const isEdit = cmdStr === 'edit';
    // プレビュー or 閲覧コンテンツ

    let commentSubmit:any = null;

    const CommentSubmitInterval = setInterval(() => {
        if(typeof document.getElementsByClassName("comment-submit") === 'undefined'){
            if(typeof document.getElementsByClassName("comment-submit") !== 'undefined'){
                commentSubmit = document.getElementsByClassName("comment-submit");
            }

            if ((isEdit) && (location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage")) {
                for(let i = 0; i < commentSubmit.length; i++){
                    commentSubmit[i].setAttribute("disabled", "true");
                }
            }
        } else {
            const ClearInterval = setInterval(() => {
                clearInterval(CommentSubmitInterval);
                clearInterval(ClearInterval);
            }, 1000);
        }
    }, 1000);

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
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (content !== editContent) {
                e.preventDefault();
                e.returnValue = "サイトから移動しますか?\n変更内容が保存されない可能性があります。";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [content, editContent]);

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
                            handleUpdate={handleUpdate}
                            title={title}
                            setTitle={setTitle}
                            content={content}
                            setContent={setContent}
                            parsedPreview={parsedPreview}
                            loading={loading}
                            wikiSlugStr={wikiSlugStr}
                            pageSlugStr={pageSlugStr}
                        />
                    ) : (
                        <>
                            <div id="contents-wrapper" style={{display: 'flex'}}>
                                <div id="container" style={{display: 'flex'}}>
                                    <article style={{ padding: '2rem', maxWidth: 1000 }} className='columnCenter'>
                                        {parsedPreview?.map((node, i) => (
                                            <React.Fragment key={i}>{node}</React.Fragment>
                                        ))}
                                        {showRedirectButton &&
                                        wikiSlugStr === special_wiki_list[0] &&
                                        (pageSlugStr === 'FrontPage') && (
                                            <button
                                            onClick={() =>
                                                router.replace(`/special_wiki/${special_wiki_list[0]}/${pageSlugStr}`)
                                            }
                                            >
                                            <span>リダイレクトされない場合はこちら</span>
                                            </button>
                                        )}
                                        <button onClick={handleEdit} style={{ marginLeft: 8 }}>
                                        <span>このページを編集</span>
                                        </button>
                                        <button onClick={handleDelete}>
                                        <span>このページを削除</span>
                                        </button>
                                        <br />
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
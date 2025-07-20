import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { parseWikiContent } from '@/utils/parsePlugins';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from 'lib/supabaseClient';
import { usePageLikeHandlers } from 'utils/Liked';
import { useWikiLikeHandlers } from 'utils/Liked';

type Page = {
    title: string
    content: string
}

export default function WikiPage() {
    const router = useRouter()
    const user = useUser();
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const cmdStr = typeof cmd === 'string' ? cmd : '';

    // クエリ→文字列化
        const wikiSlugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
        const pageSlugStr =
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
    const [urlObj, setUrlObj]   = useState<URL | null>(null)
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');
    const [designColor, setDesignColor] = useState<'pink' | 'blue' | 'yellow' | null>(null);
    const [showRedirectButton, setShowRedirectButton] = useState(false);

    useEffect(() => {
        if (!wikiSlugStr) return;

        async function fetchColor() {
            const { data, error } = await supabase
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
        if (typeof window !== 'undefined') {
            setUrlObj(new URL(window.location.href))
        }
    }, [])

    // Supabase から読み込み
    useEffect(() => {
        if (!wikiSlugStr || !pageSlugStr) return;

        setLoading(true);

        (async () => {
            console.log('wikiSlugStr:', wikiSlugStr); // ← ここで確認

            const { data: wikiData, error: wikiError } = await supabase
                .from('wikis')
                .select('edit_mode')
                .eq('slug', wikiSlugStr)
                .maybeSingle();

            if (wikiError || !wikiData) {
                setError('Wikiの情報取得に失敗しました');
                setLoading(false);
                return;
            }

            console.log('取得した edit_mode:', wikiData.edit_mode); // ← ここで確認
            setEditMode(wikiData.edit_mode);

            const { data: pageData, error: pageError } = await supabase
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

            setLoading(false);
        })();
    }, [wikiSlugStr, pageSlugStr, user]);

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
        };
    }, [designColor]);

    // 更新処理
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(editMode === 'private' && !user){
            alert("403 Forbidden あなたは編集する権限がありません");
            location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
            return;
        } else {
            if(wikiSlugStr !== "maitetsu_bkmt"){
                setLoading(true);
                const { error } = await supabase
                .from('wiki_pages')
                .update({ title, content, updated_at: new Date() })
                .eq('wiki_slug', wikiSlugStr)
                .eq('slug', pageSlugStr)
                setLoading(false)

                if (error) {
                    alert('更新に失敗しました: ' + error.message);
                } else {
                    router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
                    location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
                }
            } else if(pageSlugStr === "sinsei"){
                setLoading(true);
                const { error } = await supabase
                .from('wiki_pages')
                .update({ title, content, updated_at: new Date() })
                .eq('wiki_slug', wikiSlugStr)
                .eq('slug', pageSlugStr)
                setLoading(false)

                if (error) {
                    alert('更新に失敗しました: ' + error.message);
                } else {
                    router.push(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
                    location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
                }
            }
        }
    }

    useEffect(() => {
        if (wikiSlugStr === "maitetsu_bkmt" && pageSlugStr !== "sinsei") {
            location.href = `/special_wiki/maitetsu_bkmt/${pageSlugStr}`;
        } else {
            // 少し遅れてボタン表示を開始
            const timer = setTimeout(() => {
                setShowRedirectButton(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;

        if (pageSlugStr === 'FrontPage') {
            alert('FrontPage は削除できません');
            router.replace(`/wiki/${wikiSlugStr}`);
            return;
        }

        const confirmAndDelete = async () => {
            if(wikiSlug !== "maitetsu_bkmt"){
                const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
                if (!ok || wikiSlugStr === "maitetsu_bkmt") {
                    router.replace(`/wiki/${wikiSlugStr}/${pageSlugStr}`);
                    return;
                }

                const { error } = await supabase
                    .from('wiki_pages')
                    .delete()
                    .eq('wiki_slug', wikiSlugStr)
                    .eq('slug', pageSlugStr);

                if (error) {
                    alert('削除に失敗しました: ' + error.message);
                } else {
                    alert('削除しました');
                }

                router.replace(`/wiki/${wikiSlugStr}`);
            }
        };

        confirmAndDelete();
    }, [cmdStr, pageSlugStr, wikiSlugStr]);

    // 編集モード切り替え
    const handleEdit = () => {
        router.push({
            pathname: `/wiki/${wikiSlugStr}`,
            query: { cmd: 'edit', page: pageSlugStr },
        });
        location.href = `/wiki/${wikiSlugStr}?cmd=edit&page=${pageSlugStr}`;
    };

    const handleDelete = () => {
        if(editMode === 'private' && !user){
            alert("403 Forbidden あなたは削除する権限がありません");
            location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
            return;
        } else {
            if(wikiSlug !== "maitetsu_bkmt"){
                router.push({
                    pathname: `/wiki/${wikiSlugStr}`,
                    query: { cmd: 'delete', page: pageSlugStr },
                });
                location.href = `/wiki/${wikiSlugStr}?cmd=delete&page=${pageSlugStr}`;
            }
        }
    }
    const isEdit = urlObj?.searchParams.get('cmd') === 'edit'
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
    const parsedPreview = useMemo(
        () =>
        parseWikiContent(previewText, {
            wikiSlug: wikiSlugStr,
            pageSlug: pageSlugStr,
        }),
        [previewText, wikiSlugStr, pageSlugStr]
    )

    const { handlePageLike, handlePageDisLike } = usePageLikeHandlers();
    const { handleWikiLike, handleWikiDisLike } = useWikiLikeHandlers();

    if (error) return <div style={{ color: 'red', padding: '2rem' }}>{error}</div>
    if (loading || !page) return <div style={{ padding: '2rem' }}>読み込み中…</div>

    useEffect(() => {
        console.log('userId:', user);
        console.log('wikiSlugStr:', wikiSlugStr);
        console.log('pageSlugStr:', pageSlugStr);
    }, []);

    return (
        <>
        <Head>
            <title>
            {page.title}
            {isEdit ? ' を編集' : null}
            </title>
        </Head>
        {isEdit ? (
            <main style={{ padding: '2rem', maxWidth: 600 }}>
            <h1>📝 ページ編集</h1>
            <form onSubmit={handleUpdate}>
                <label>
                タイトル:
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ width: '100%', margin: '8px 0', padding: 6 }}
                />
                </label>
                <label>
                内容:
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{ width: '100%', height: 300, padding: 6 }}
                    autoFocus
                />
                </label>
                <h2>プレビュー：</h2>
                <div
                style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    background: '#f9f9f9',
                    minHeight: 100,
                }}
                >
                {parsedPreview.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                ))}
                </div>
                <button
                type="submit"
                disabled={
                    loading ||
                    (wikiSlugStr === 'maitetsu_bkmt' && pageSlugStr !== 'sinsei')
                }
                style={{ marginTop: 12, padding: '0.6rem 1.2rem' }}
                >
                    <span>{loading ? '保存中…' : '保存'}</span>
                </button>
            </form>
            </main>
        ) : (
            <article style={{ padding: '2rem', maxWidth: 800 }}>
            {parsedPreview.map((node, i) => (
                <React.Fragment key={i}>{node}</React.Fragment>
            ))}

            <div style={{ marginTop: '2rem' }}>
                {showRedirectButton &&
                wikiSlugStr === 'maitetsu_bkmt' &&
                pageSlugStr !== 'sinsei' && (
                    <button
                    onClick={() =>
                        router.replace(`/special_wiki/maitetsu_bkmt/${pageSlugStr}`)
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
            </div>
            </article>
        )}
        </>
    )
}
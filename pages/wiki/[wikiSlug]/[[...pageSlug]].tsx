import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { parseWikiContent } from '@/utils/parsePlugins';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from 'lib/supabaseClient';
import usePageLikeHandlers from 'utils/Liked';

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
    const systemMentenans:boolean = true; // メンテナンスフラグ

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

    // エラー or 読み込み中
    if (error)   return <div style={{ color: 'red' }}>{error}</div>
    if (loading || !page) return <div>読み込み中…</div>

    const isEdit = urlObj?.searchParams.get('cmd') === 'edit'
    const context = { wikiSlug: wikiSlugStr, pageSlug: pageSlugStr }
    // プレビュー or 閲覧コンテンツ
    const parseTarget = isEdit ? content : page.content

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

    const parsedPreview = useMemo(() => {
        return parseWikiContent(content, context);
    }, [content, context]);

    const Page = () => {
        const { handlePageLike, handlePageDisLike } = usePageLikeHandlers();
        return (
            <>
                {systemMentenans ? (
                    <>
                        <Head>
                            <title>只今システムメンテナンス中です..</title>
                        </Head>
                        <div id="systemMentenans">
                            <p>只今システムメンテナンス中です..</p>
                            <img src="https://yt3.googleusercontent.com/MUE4-7_ByFpq_d_9FmD6j0c39USgvt9xKQxClkBIg0U2RkI4jHUbIvyh8CTOAEDcBre1QbMDeQ=s160-c-k-c0x00ffffff-no-rj" alt="メンテナンス中画像"/>
                        </div>
                    </>
                ) : (
                    <>
                        <Head>
                            <title>
                                {page.title}
                                {isEdit ? ' を編集' : ''}
                            </title>
                        </Head>
                        <div>
                            {(isEdit) && (location.pathname === `/wiki/${wikiSlugStr}` || pageSlugStr === "FrontPage") ? (
                                <main style={{ padding: '2rem', maxWidth: 600 }}>
                                <h1>📝 ページ編集</h1>
                                <form onSubmit={handleUpdate}>
                                    <label>
                                    タイトル:
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        style={{ width: '100%', marginTop: 4 }}
                                    />
                                    </label>
                                    <br /><br />
                                    <label>
                                    内容:
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        style={{ width: '200%', height: 500, marginTop: 4 }}
                                    ></textarea>
                                    </label>
                                    <br /><br />
                                    <h2>プレビュー：</h2>
                                    <div
                                        style={{
                                            border: '1px solid #ccc',
                                            padding: '1rem',
                                            background: '#f9f9f9',
                                            minHeight: 100
                                        }}
                                    >
                                        {parsedPreview.map((node, i) => (
                                            <React.Fragment key={i}>{node}</React.Fragment>
                                        ))}
                                    </div>
                                    <br /><br />
                                    { wikiSlugStr === "maitetsu_bkmt" && pageSlugStr !== "sinsei" ? (
                                        <button type="submit" disabled>
                                            <span>
                                                {loading ? '保存中…' : '保存'}
                                            </span>
                                        </button>
                                    ) : (
                                        <button type="submit" disabled={loading}>
                                            <span>
                                                {loading ? '保存中…' : '保存'}
                                            </span>
                                        </button>
                                    )}
                                </form>
                                </main>
                            ) : (
                                <div style={{ padding: '2rem', maxWidth: 800 }}>
                                <div>
                                    {parseWikiContent(parseTarget, context).map((node, i) => (
                                    <React.Fragment key={i}>{node}</React.Fragment>
                                    ))}
                                </div>
                                <br />
                                    <div id="button-container">
                                        {showRedirectButton && wikiSlugStr === "maitetsu_bkmt" && pageSlugStr !== "sinsei" ? (
                                            <button onClick={() => location.href = `/special_wiki/maitetsu_bkmt/${pageSlugStr}`}>
                                                <span>
                                                    リダイレクトされない場合はこちら
                                                </span>
                                            </button>
                                        ) : (
                                            null
                                        )}
                                        <button onClick={handleEdit}><span>このページを編集</span></button>
                                        <button onClick={handleDelete}><span>このページを削除</span></button>
                                        <br/>
                                        <button onClick={handlePageLike}><span>このページを高く評価</span></button>
                                        <button onClick={handlePageDisLike}><span>このページを低く評価</span></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </>
        )
    }
    return <Page/>
}
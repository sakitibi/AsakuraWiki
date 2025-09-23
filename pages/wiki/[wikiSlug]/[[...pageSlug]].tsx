import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { parseWikiContent } from '@/utils/parsePlugins';
import { useUser } from '@supabase/auth-helpers-react';
import { supabaseServer } from 'lib/supabaseClientServer';
import { usePageLikeHandlers, useWikiLikeHandlers } from 'utils/Liked';
import Script from 'next/script';
import styles from 'css/wikis.min.module.css';
import { special_wiki_list, ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import FooterJp from '@/utils/pageParts/top/FooterJp';

interface Page {
    title: string
    content: string
}

export default function WikiPage() {
    const router = useRouter()
    const user = useUser();
    const { wikiSlug, pageSlug, page: pageQuery, cmd } = router.query;
    const cmdStr = typeof router.query.cmd === 'string' ? router.query.cmd : '';

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
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');
    const [designColor, setDesignColor] = useState<'pink' | 'blue' | 'yellow' | null>(null);
    const [showRedirectButton, setShowRedirectButton] = useState(false);
    const [parsedPreview, setParsedPreview] = useState<React.ReactNode[] | null>(null);
    const [editContent, setEditContent] = useState<string>("");

    const special_wiki_list_found = special_wiki_list.find(value => value === wikiSlugStr);
    const ban_wiki_list_found = ban_wiki_list.find(value => value === wikiSlugStr);
    const deleted_wiki_list_found = deleted_wiki_list.find(value => value === wikiSlugStr);

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
                <>
                    <Head>
                        <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.min.css"/>
                        <title>404 Not Found</title>
                    </Head>
                    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                        <div className="article text-center">
                            <h1>404 Not Found</h1>
                            <div className={styles.noticeWikiRemoval} role='alert'>
                                <span className="noticeWikiRemoval__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                        <path d="M96 256L96 96L544 96L544 256L640 256L640 304L544 304L544 512L352 512L192 608L192 512L96 512L96 304L0 304L0 256L96 256zM160 192L160 384L480 384L480 192L160 192zM256 256C273.7 256 288 270.3 288 288C288 305.7 273.7 320 256 320C238.3 320 224 305.7 224 288C224 270.3 238.3 256 256 256zM352 288C352 270.3 366.3 256 384 256C401.7 256 416 270.3 416 288C416 305.7 401.7 320 384 320C366.3 320 352 305.7 352 288z"></path>
                                    </svg>
                                </span>
                                <span className="noticeWikiRemoval__text">
                                    <strong>重要：</strong>
                                    <b>お探しのコンテンツは当サービスの利用規約に違反したため削除されました。</b>
                                </span>
                            </div>
                            <div className={styles.noticeWikiRemovalRelated}>
                                <span className="noticeWikiRemoval__icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                        <path d="M544 96L96 96L96 544L544 544L544 96zM280 400L304 400L304 336L256 336L256 288L352 288L352 400L384 400L384 448L256 448L256 400L280 400zM352 192L352 256L288 256L288 192L352 192z"></path>
                                    </svg>
                                </span>
                                <span className="noticeWikiRemoval__text">
                                    関連ページ：
                                    <a href="https://sakitibi-com9.webnode.jp/page/10" target='_blank'>13nin利用規約</a>
                                    <a href="/policies" target='_blank'>あさクラWiki利用規約</a>
                                </span>
                            </div>
                            <svg className={styles.noticeWikiRemoval__overlayIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                                <path d="M496 608C416.5 608 352 543.5 352 464C352 384.5 416.5 320 496 320C575.5 320 640 384.5 640 464C640 543.5 575.5 608 496 608zM268.6 70.5C280.8 61.2 298.3 61.8 309.8 72.5L527.4 274.5C517.2 272.8 506.7 271.9 496.1 271.9C417.5 271.9 349.9 319.1 320.2 386.7C315.2 384.9 309.7 383.9 304.1 383.9L272.1 383.9C245.6 383.9 224.1 405.4 224.1 431.9L224.1 527.9L315 527.9C321.1 545.2 329.6 561.3 340.2 575.9L144 576C108.7 576 80 547.3 80 512L80 336L64 336C50.8 336 39 327.9 34.2 315.7C29.4 303.5 32.6 289.5 42.2 280.6L266.2 72.6L268.6 70.6zM555.3 404.7C549.1 398.5 538.9 398.5 532.7 404.7L496 441.4L459.3 404.7C453.1 398.5 442.9 398.5 436.7 404.7C430.5 410.9 430.5 421.1 436.7 427.3L473.4 464L436.7 500.7C430.5 506.9 430.5 517.1 436.7 523.3C442.9 529.5 453.1 529.5 459.3 523.3L496 486.6L532.7 523.3C538.9 529.5 549.1 529.5 555.3 523.3C561.5 517.1 561.5 506.9 555.3 500.7L518.6 464L555.3 427.3C561.5 421.1 561.5 410.9 555.3 404.7z"></path>
                            </svg>
                        </div>
                    </main>
                    <FooterJp/>
                </>
            ) : deleted_wiki_list_found ? (
                <>
                    <Head>
                        <link rel="stylesheet" href="https://sakitibi.github.io/static.asakurawiki.com/css/404.min.css"/>
                        <title>404 Not Found</title>
                    </Head>
                    <main style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                        <div className="article text-center">
                            <h1>404 Not Found</h1>
                            <p>お探しのコンテンツはユーザー退会のため削除されました。</p>
                        </div>
                    </main>
                    <FooterJp/>
                </>
            ) : (
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
                            {parsedPreview?.map((node, i) => (
                                <React.Fragment key={i}>{node}</React.Fragment>
                            ))}
                            </div>
                            <button
                            type="submit"
                            disabled={
                                loading ||
                                (wikiSlugStr === special_wiki_list[0] && pageSlugStr !== 'sinsei')
                            }
                            style={{ marginTop: 12, padding: '0.6rem 1.2rem' }}
                            >
                                <span>{loading ? '保存中…' : '保存'}</span>
                            </button>
                        </form>
                        </main>
                    ) : (
                        <>
                            <div id="contents-wrapper" style={{display: 'flex'}}>
                                <div id="container" style={{display: 'flex'}}>
                                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
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
                                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="650" height="311"></iframe>
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
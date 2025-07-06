import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { parseWikiContent } from '@/utils/parsePlugins'
import { useUser } from '@supabase/auth-helpers-react';

type Page = {
    title: string
    content: string
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let designColor: 'pink' | 'default' | null = null;

async function fetchDesignColor() {
    const { data, error } = await supabase
        .from('wikis')
        .select('design_color')
        .limit(1)
        .single();

    if (error) {
        console.error('データ取得エラー:', error);
        return null;
    }

    return data.design_color;
}

(async function () {
    designColor = await fetchDesignColor();
    console.log('取得したデザインカラー:', designColor);
})();

const commonStyle = `
    html, body {
        font-family: Verdana, Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif !important;
        font-size: 12px !important;
    }
`;

const pinkStyle = `
    body {
        background-image: linear-gradient(to right, rgb(233, 120, 203), rgb(231, 110, 185), rgb(217, 70, 195), rgb(185, 21, 164), rgb(217, 75, 198), rgb(215, 113, 221)) !important;
        background-size: 300% 100%;
        background-attachment: fixed;
        animation: bg-color 150s linear infinite;
        font-size: 15px;
        font-style: normal;
        font-weight: bold;
    }

    button::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background-image: linear-gradient(to left, rgb(244, 164, 229), rgb(199, 17, 157)) !important;
        transition: filter 0.3s ease, transform 0.1s ease;
    }
`;

const styleString = designColor === 'pink'
    ? `${commonStyle}\n${pinkStyle}`
    : commonStyle;

console.log('styleString:', styleString);

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
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState<string | null>(null)
    const [title, setTitle]     = useState('')
    const [content, setContent] = useState('')  // ← textarea の中身
    const [urlObj, setUrlObj]   = useState<URL | null>(null)
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');

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
            // 1. 対象のWikiの編集モード取得
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

            const isPrivate = wikiData.edit_mode === 'private';

            // 3. ページ取得
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

    // 更新処理
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if(editMode === 'private' && !user){
            alert("403 Forbidden あなたは編集する権限がありません");
            location.href = `/wiki/${wikiSlugStr}/${pageSlugStr}`;
            return;
        } else {
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

    useEffect(() => {
        if (cmdStr !== 'delete') return;
        if (!pageSlugStr || !wikiSlugStr) return;

        if (pageSlugStr === 'FrontPage') {
            alert('FrontPage は削除できません');
            router.replace(`/wiki/${wikiSlugStr}`);
            return;
        }

        const confirmAndDelete = async () => {
            const ok = confirm(`「${pageSlugStr}」ページを本当に削除しますか？`);
            if (!ok) {
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
            router.push({
                pathname: `/wiki/${wikiSlugStr}`,
                query: { cmd: 'delete', page: pageSlugStr },
            });
            location.href = `/wiki/${wikiSlugStr}?cmd=delete&page=${pageSlugStr}`;
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

    return (
        <>
            <Head>
                <title>
                    {page.title}
                    {isEdit ? ' を編集' : ''}
                </title>
                <style jsx global>{styleString}</style>
            </Head>
            <body className='wiki-font'>
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
                        {parseWikiContent(parseTarget, context).map((node, i) => (
                            <React.Fragment key={i}>{node}</React.Fragment>
                        ))}
                        </div>
                        <br /><br />
                        <button type="submit" disabled={loading}>
                            <span>
                                {loading ? '保存中…' : '保存'}
                            </span>
                        </button>
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
                        <div>
                            <button onClick={handleEdit}><span>このページを編集</span></button>
                            <button onClick={handleDelete}><span>このページを削除</span></button>
                        </div>
                    </div>
                )}
            </body>
        </>
    )
}
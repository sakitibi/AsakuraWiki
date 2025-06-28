import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

type Page = {
    title: string;
    content: string;
};

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WikiPage() {
    const router = useRouter();
    const { slug } = router.query;

    // slugを文字列に変換（キャッチオール対応）
    const slugStr = Array.isArray(slug) ? slug.join('/') : slug ?? '';

    const [page, setPage] = useState<Page | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [url, setUrl] = useState<URL | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
        setUrl(new URL(window.location.href));
        }
    }, []);

    useEffect(() => {
        if (!slugStr) return;
        setLoading(true);

        (async () => {
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('title, content')
            .eq('slug', slugStr)
            .single();

        if (error) {
            setError('ページの読み込みに失敗しました');
            setPage(null);
        } else {
            setPage(data);
            setTitle(data.title);
            setContent(data.content);
            setError(null);
        }
        setLoading(false);
        })();
    }, [slugStr]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
        .from('wiki_pages')
        .update({ title, content, updated_at: new Date() })
        .eq('slug', slugStr);

        setLoading(false);

        if (error) {
        alert('更新に失敗しました: ' + error.message);
        } else {
        router.push(`/wiki/${slugStr}`);
        }
    };

    const handleEdit = () => {
        router.push(`/wiki/${slugStr}?cmd=edit`);
        location.href = `/wiki/${slugStr}?cmd=edit`;
    };

    function parseAccordion(text?: string | null): string {
        if (typeof text !== 'string') {
            // null/undefined/その他を受け取ったら空文字列を返す
            return '';
        }
        return text.replace(
            /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/g,
            (_, title, level, state, body) => {
            const openAttr = state === 'open' ? 'open' : '';
            const headingTag = level === '*' ? 'h3' : level === '**' ? 'h4' : 'h5';
            return `
                <details ${openAttr}>
                <summary><${headingTag}>${title}</${headingTag}></summary>
                <div>${body.trim().replace(/\n/g, '<br>')}</div>
                </details>
            `;
            }
        );
    }

    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (loading || !page) return <div>読み込み中…</div>;

    return url?.searchParams.get('cmd') === 'edit' ? (
        <>
        <Head>
            <title>{page.title} を編集</title>
        </Head>
        <main style={{ padding: '2rem', maxWidth: 600 }}>
            <h1>📝 ページ編集</h1>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            <form onSubmit={handleUpdate}>
            <label>
                タイトル:
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
                />
            </label>
            <br />
            <br />
            <label>
                内容:
                <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', height: 200 }}
                />
            </label>
            <br />
            <br />
            <h2>プレビュー:</h2>
            <div
                style={{ border: '1px solid #ccc', padding: '1rem', background: '#f9f9f9' }}
                dangerouslySetInnerHTML={{ __html: parseAccordion(content) }}
            />
            <br />
            <br />
            <button type="submit" disabled={loading}>
                {loading ? '保存中…' : '保存'}
            </button>
            </form>
        </main>
        </>
    ) : (
        <>
        <Head>
            <title>{page.title}</title>
        </Head>
        <div>
            <div dangerouslySetInnerHTML={{ __html: parseAccordion(page.content) }} />
            <br />
            <button onClick={handleEdit}><span>このページを編集</span></button>
        </div>
        </>
    );
}
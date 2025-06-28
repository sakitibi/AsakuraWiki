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
    const [page, setPage] = useState<Page | null>(null);
    const [error, setError] = useState<string | null>(null);
    const url = new URL(location.href);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // slugが配列の場合は結合
    const slugStr = Array.isArray(slug) ? slug.join('/') : slug;

    useEffect(() => {
        if (!slug) return;
        (async () => {
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('title, content')
            .eq('slug', slug)
            .single();

        if (error) {
            setErrorMsg('ページの読み込みに失敗しました');
        } else {
            setTitle(data.title);
            setContent(data.content);
        }
        setLoading(false);
        })();
    }, [slug]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase
        .from('wiki_pages')
        .update({ title, content, updated_at: new Date() })
        .eq('slug', slug);

        setLoading(false);
        if (error) {
        alert('更新に失敗しました: ' + error.message);
        } else {
        router.push(`/wiki/${slug}`);
        }
    };

    useEffect(() => {
        if (!slugStr) return;

        const fetchPage = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wiki/${slugStr}`);
                if (!res.ok) throw new Error(`ページ取得エラー: ${res.status}`);
                const data = await res.json();
                setPage(data);
                setError(null);
            } catch (e: any) {
                setError(e.message || '不明なエラー');
            }
        };

        fetchPage();
    }, [slugStr]);

    const handleEdit = () => {
        router.push(`/wiki/${slugStr}?cmd=edit`);
    };

    function parseAccordion(content: string): string {
        return content.replace(
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

    if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
    if (!page) return <div>読み込み中...</div>;

    return (
        url.searchParams.get("cmd") === 'edit' ? (
            <>
                <Head>
                    <title>{page.title}を編集</title>
                </Head>
                <div>
                    <main style={{ padding: '2rem', maxWidth: 600 }}>
                        <h1>📝 ページ編集</h1>
                        {errorMsg ? (
                            <p style={{ color: 'red' }}>{errorMsg}</p>
                        ) : (
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
                            <br /><br />
                            <label>
                                内容:
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    style={{ width: '100%', height: 200 }}
                                />
                            </label>

                            <br /><br />
                            <h2>プレビュー:</h2>
                            <div
                                style={{ border: '1px solid #ccc', padding: '1rem', background: '#f9f9f9' }}
                                dangerouslySetInnerHTML={{ __html: parseAccordion(content) }}
                            />

                            <br /><br />
                            <button type="submit" disabled={loading}>
                                <span>{loading ? '保存中…' : '保存'}</span>
                            </button>
                            </form>
                        )}
                    </main>
                </div>
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
        )
        
    );
}
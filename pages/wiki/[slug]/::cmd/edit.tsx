import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditWikiPage() {
    const router = useRouter();
    const { slug } = router.query;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

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

    if (loading) return <p>読み込み中...</p>;

    return (
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
            <button type="submit" disabled={loading}>
                <span>{loading ? '保存中…' : '保存'}</span>
            </button>
            </form>
        )}
        </main>
    );
}
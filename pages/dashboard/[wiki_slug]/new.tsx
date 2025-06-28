import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@supabase/auth-helpers-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewPage() {
    const router = useRouter();
    const user = useUser();
    const { wiki_slug } = router.query;

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!wiki_slug || typeof wiki_slug !== 'string') return;

        const fetchEditMode = async () => {
        const { data, error } = await supabase
            .from('wikis')
            .select('edit_mode')
            .eq('slug', wiki_slug)
            .maybeSingle();

        if (error || !data) {
            alert('Wikiの設定取得に失敗しました');
            return;
        }

        setEditMode(data.edit_mode);
        };

        fetchEditMode();
    }, [wiki_slug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editMode === 'private' && !user) {
            alert('このWikiはログインしないとページ作成できません');
            return;
        }

        if (editMode === 'private' && !user) {
            alert('ログインが必要です');
            router.push('/login'); // 例：ログイン画面に飛ばす
        }

        setLoading(true);

        const { data, error } = await supabase
        .from('wiki_pages')
        .insert([
            {
            wiki_slug,
            slug,
            title,
            content,
            author_id: user!.id,
            }
        ])
        .select()
        .single();

        setLoading(false);

        if (error) {
            alert('作成に失敗しました: ' + error.message);
            return;
        }

        router.push(`/wiki/${wiki_slug}/${slug}`);
    };

    return (
        <main style={{ padding: '2rem', maxWidth: 600 }}>
        <h1>📝 新しいページを作成</h1>
        <form onSubmit={handleSubmit}>
            <label>
            ページID（URL用）:
            <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="例: getting-started"
                style={{ width: '100%' }}
            />
            </label>
            <br /><br />
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
                style={{ width: '100%', height: 150 }}
            />
            </label>
            <br /><br />
            <button type="submit" disabled={loading}>
            {loading ? '作成中…' : 'ページ作成'}
            </button>
        </form>
        </main>
    );
}
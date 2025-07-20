import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from 'lib/supabaseClient';

export default function NewPage() {
    const router = useRouter();
    const user = useUser();
    const { wikiSlug } = router.query; // ✅ 変数名統一
    const wikiSlugStr = typeof wikiSlug === 'string' ? wikiSlug : '';

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [ownerId, setownerId] = useState<string>('');

    // ✅ wikiSlug が確定してから実行
    useEffect(() => {
        if (!wikiSlugStr) return;

        const fetchWiki = async() => {
            const { data, error } = await supabase
            .from('wikis')
            .select('name, description, owner_id, edit_mode, design_color')
            .eq('slug', wikiSlugStr)
            .maybeSingle();
            if (error) {
                console.error('Supabase fetch error:', error);
                setErrorMsg('サーバーエラーが発生しました。');
                setLoading(false);
                return;
            }
            setownerId(data?.owner_id);
        }

        const fetchEditMode = async () => {
            const { data, error } = await supabase
                .from('wikis')
                .select('edit_mode')
                .eq('slug', wikiSlugStr)
                .maybeSingle();

            if (error || !data) {
                alert('Wikiの設定取得に失敗しました');
                return;
            }

            setEditMode(data.edit_mode);
        };

        fetchWiki();
        fetchEditMode();
    }, [wikiSlugStr, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🔐 プライベートWikiならログイン必須
        if (editMode === 'private' && !user) {
            alert('このWikiはログインしないとページ作成できません');
            router.push('/login');
            return;
        }

        if(wikiSlugStr === "maitetsu_bkmt" && ownerId !== user!.id){
            alert('このWikiはログインしないとページ作成できません');
            router.push('/login');
            return;
        }

        if (!wikiSlugStr) {
            alert('Wikiの識別子が無効です');
            return;
        }

        if (slug.trim().toLowerCase().endsWith('.askr')) {
            alert('ページIDの末尾に「.askr」を使用することはできません。');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
        .from('wiki_pages')
        .insert([
            {
            wiki_slug: wikiSlugStr,
            slug,
            title,
            content,
            author_id: user?.id ?? null, // 安全化
            }
        ])
        .select()
        .single();
        setLoading(false);

        if (error) {
            alert('作成に失敗しました: ' + error.message);
            return;
        }

        // ✅ 正常なWikiページにリダイレクト
        router.push(`/wiki/${wikiSlugStr}/${slug}`);
    };

    // ✅ クエリ未確定時はローディング画面
    if (!router.isReady) return <div>読み込み中…</div>;

    return (
        <>       
            {errorMsg ? (
                <p style={{ color: 'red' }}>{errorMsg}</p>
            ) : (
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
                    <button type="submit" disabled={loading || !wikiSlugStr}>
                        <span>
                            {loading ? '作成中…' : 'ページ作成'}
                        </span>
                    </button>
                </form>
                </main>
            )}
        </>
    );
}
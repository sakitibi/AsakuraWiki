import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { useUser } from '@supabase/auth-helpers-react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WikiSettingsPage() {
    const router = useRouter();
    const { slug } = router.query;
    const user = useUser();

    const [wiki, setWiki] = useState<{ name: string; description: string } | null>(null);
    const [name, setName] = useState('');
    const [editMode, setEditMode] = useState('public');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!slug || !user) return;

        const fetchWiki = async () => {
            const { data, error } = await supabase
            .from('wikis')
            .select('name, description, owner_id, edit_mode') // ← 必ず edit_mode を取得
            .eq('slug', slug)
            .single();

            if (error) {
                setErrorMsg('Wikiの読み込みに失敗しました。');
                setLoading(false);
                return;
            }

            if (data.owner_id !== user.id) {
                setErrorMsg('このWikiの管理者ではありません。');
                setLoading(false);
                return;
            }

            setWiki(data);
            setName(data.name);
            setDescription(data.description);
            setEditMode(data.edit_mode || 'public'); // ✅ ここで data.edit_mode を使う
            setLoading(false);
        };

        fetchWiki();
    }, [slug, user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
        .from('wikis')
        .update({ name, description, edit_mode: editMode, updated_at: new Date() })
        .eq('slug', slug);

        setLoading(false);

        if (error) {
        alert('更新に失敗しました: ' + error.message);
        } else {
        alert('設定を保存しました');
        }
    };

    if (loading) return <p>読み込み中...</p>;

    return (
        <main style={{ padding: '2rem', maxWidth: 600 }}>
        <h1>🔧 Wiki設定</h1>
        {errorMsg ? (
            <p style={{ color: 'red' }}>{errorMsg}</p>
        ) : (
            <form onSubmit={handleUpdate}>
            <label>
                Wikiタイトル:
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%' }}
                required
                />
            </label>
            <br /><br />
            <label>
                説明:
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', height: 100 }}
                />
            </label>
            <br /><br />
            <label>
            編集モード:
            <select
                value={editMode}
                onChange={(e) => setEditMode(e.target.value)}
                style={{ width: '100%' }}
            >
                <option value="private">🔒 ログインユーザーのみ編集可</option>
                <option value="public">🌐 誰でも編集可</option>
            </select>
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
import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateWikiPage() {
    const [wikiId, setWikiId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!agree) {
            alert('利用規約に同意してください。');
            return;
        }

        setLoading(true);

        const {
        data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert('ログインしてください');
            setLoading(false);
            return;
        }

        const slug = wikiId.trim().toLowerCase();

        const { data, error } = await supabase
        .from('wiki_pages')  // ← ← ← テーブル名をここに合わせる
        .insert([
            {
            slug,
            title,
            description,
            owner_id: user.id,
            },
        ])
        .select()
        .single();

        setLoading(false);

        if (error) {
            alert('作成に失敗しました: ' + error.message);
            return;
        }

        router.push(`/wiki/${slug}`);
    };

    return (
        <main style={{ padding: '2rem', maxWidth: 600 }}>
        <h1>🆕 新しいWikiを作る</h1>
        <form onSubmit={handleSubmit}>
            <label>
            Wiki ID（変更できません）:
            <input
                value={wikiId}
                onChange={(e) => setWikiId(e.target.value)}
                required
                pattern="^[a-z0-9\-]+$"
                title="小文字の英数字とハイフンのみ使用できます"
                placeholder="例: my-wiki-id"
                style={{ width: '100%' }}
            />
            </label>
            <br /><br />
            <label>
            Wikiタイトル（変更可能）:
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%' }}
            />
            </label>
            <br /><br />
            <label>
            説明:
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', height: 80 }}
            />
            </label>
            <br /><br />
            <label>
            <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
            />
            <a href='https://sakitibi-com9.webnode.jp/page/10'>利用規約</a>に同意します
            </label>
            <br /><br />
            <button type="submit" disabled={loading}>
            <span>{loading ? '作成中…' : 'Wikiを作成'}</span>
            </button>
        </form>
        </main>
    );
}
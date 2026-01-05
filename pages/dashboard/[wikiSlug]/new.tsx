import { NextRouter, useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession, User, Session } from '@supabase/auth-helpers-react';
import { supabaseClient } from '@/lib/supabaseClient';

export default function NewPage() {
    const router:NextRouter = useRouter();
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const session:Session | null = useSession();
    const { wikiSlug } = router.query; // ✅ 変数名統一
    const wikiSlugStr:string = typeof wikiSlug === 'string' ? wikiSlug : '';

    const [title, setTitle] = useState<string>('');
    const [slug, setSlug] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [editMode, setEditMode] = useState<'private' | 'public'>('public');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [ownerId, setownerId] = useState<string>('');

    // ✅ wikiSlug が確定してから実行
    useEffect(() => {
        if (!wikiSlugStr) return;

        const fetchWiki = async() => {
            const { data, error } = await supabaseClient
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
            const { data, error } = await supabaseClient
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
        setLoading(true);

        if (!wikiSlugStr) {
            alert('Wikiの識別子が無効です');
            setLoading(false);
            return;
        }

        if (slug.trim().toLowerCase().endsWith('.askr')) {
            alert('ページIDの末尾に「.askr」を使用することはできません。');
            setLoading(false);
            return;
        }

        if (editMode === 'private' && !user) {
            alert('このWikiはログインしないとページ作成できません');
            setLoading(false);
            router.push('/login');
            return;
        }

        if(wikiSlugStr === "maitetsu_bkmt" && ownerId !== user!.id){
            alert('このWikiはページ作成できません');
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/wiki/${wikiSlugStr}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token ?? ''}`
                },
                body: JSON.stringify({ slug, title, content }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert('作成に失敗しました: ' + data.error);
                return;
            }

            router.push(`/wiki/${wikiSlugStr}/${slug}`);
        } catch (err: any) {
            console.error(err);
            alert('作成中にエラーが発生しました: ' + err.message);
        } finally {
            setLoading(false);
        }
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
                        <i
                            className="fa-classic fa-solid fa-file-plus"
                            style={{ fontSize: 'inherit' }}
                        ></i>
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
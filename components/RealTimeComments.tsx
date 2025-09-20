import { useEffect, useState } from 'react'
import { supabaseServer } from 'lib/supabaseClientServer';
import { User, useUser } from '@supabase/auth-helpers-react';
import { PostgrestSingleResponse, RealtimeChannel } from '@supabase/supabase-js';

interface Comment {
    id: number
    name: string
    body: string
    wiki_slug: string
    page_slug: string
    created_at: string
}

interface Props{
    wikiSlug: string
    pageSlug: string
}

export default function RealTimeComments({ wikiSlug, pageSlug }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [name, setName] = useState<string>('')
    const [body, setBody] = useState<string>('')
    const [isSending, setIsSending] = useState<boolean>(false)
    const user:User | null = useUser();

    useEffect(() => {
        if (!wikiSlug || !pageSlug) return

        // ── 初回ロード ──
        ;(async () => {
            const res:PostgrestSingleResponse<any[]> = await supabaseServer
                .from('comments')
                .select('*')
                .eq('wiki_slug', wikiSlug)
                .eq('page_slug', pageSlug)
                .order('created_at', { ascending: true })

            const data:Comment[] = (res.data as Comment[]) || []
            setComments(data)
        })()

        // ── リアルタイム購読 ──
        const channel:RealtimeChannel = supabaseServer
            .channel(`comments-${wikiSlug}-${pageSlug}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                },
                (payload: { new: Comment }) => {
                    const comment = payload.new;
                    if (comment.wiki_slug === wikiSlug && comment.page_slug === pageSlug) {
                        setComments(prev => [...prev, comment]);
                    }
                }
            )
            .subscribe((status) => {
                console.log('リアルタイムチャンネルの接続状態:', status);
                if (status !== 'SUBSCRIBED') {
                    console.warn('チャンネルがまだ準備できていません');
                }
            });

        return () => {
            supabaseServer.removeChannel(channel)
        }
    }, [wikiSlug, pageSlug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // ← これを追加！
        if (!name.trim() || !body.trim()) {
            alert('名前とコメントを入力してください');
            return;
        }

        setIsSending(true);
        const res:PostgrestSingleResponse<null> = await supabaseServer.from('comments').insert({
            name,
            body,
            wiki_slug: wikiSlug,
            page_slug: pageSlug,
            user_id: user?.id
        });

        if (res.error) {
            alert('送信に失敗しました');
            console.error('送信エラー:', res.error);
        } else {
            setBody('');
        }
        setIsSending(false);
    };

    return (
        <div style={{ marginTop: '1em' }}>
            <ul style={{ marginBottom: '1em' }}>
                {comments.map(c => (
                    <li key={c.id} style={{ marginBottom: '0.5em' }}>
                        <strong>{c.name}</strong> ({new Date(c.created_at).toLocaleString()}):<br />
                        <p>{c.body}</p>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '0.5em' }}>
                    <input
                        type="text"
                        placeholder="名前"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ padding: '0.5em', width: '100%', marginBottom: '0.5em' }}
                    />
                    <textarea
                        placeholder="コメント"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={3}
                        style={{ padding: '0.5em', width: '100%' }}
                        required
                    />
                </div>
                <button
                    disabled={isSending}
                    className="comment-submit"
                    style={{ padding: '0.5em 1em', backgroundColor: '#ea94bc', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    <span>
                        {isSending ? '送信中...' : '送信'}
                    </span>
                </button>
            </form>
        </div>
    )
}
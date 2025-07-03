import { useEffect, useState } from 'react'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Comment {
    id: number
    name: string
    body: string
    wiki_slug: string
    page_slug: string
    created_at: string
}

type Props = {
    wikiSlug: string
    pageSlug: string
}

export default function RealTimeComments({ wikiSlug, pageSlug }: Props) {
    const [comments, setComments] = useState<Comment[]>([])
    const [name, setName] = useState('')
    const [body, setBody] = useState('')
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        if (!wikiSlug || !pageSlug) return

        // ── 初回ロード ──
        ;(async () => {
            const res = await supabase
                .from('comments')
                .select('*')
                .eq('wiki_slug', wikiSlug)
                .eq('page_slug', pageSlug)
                .order('created_at', { ascending: true })

            const data = (res.data as Comment[]) || []
            setComments(data)
        })()

        // ── リアルタイム購読 ──
        const channel: RealtimeChannel = supabase
            .channel(`comments-${wikiSlug}-${pageSlug}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `wiki_slug=eq.${wikiSlug} and page_slug=eq.${pageSlug}`,
                },
                (payload: { new: Comment }) => {
                    setComments(prev => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [wikiSlug, pageSlug])

    const handleSubmit = async () => {
        if (!name.trim() || !body.trim()) {
            alert('名前とコメントを入力してください')
            return
        }

        setIsSending(true)
        const res = await supabase.from('comments').insert({
            name,
            body,
            wiki_slug: wikiSlug,
            page_slug: pageSlug,
        })

        if (res.error) {
            alert('送信に失敗しました')
            console.error(res.error)
        } else {
            setBody('')
        }
        setIsSending(false)
    }

    return (
        <div style={{ marginTop: '1em' }}>
            <ul style={{ marginBottom: '1em' }}>
                {comments.map(c => (
                    <li key={c.id} style={{ marginBottom: '0.5em' }}>
                        <strong>{c.name}</strong> ({new Date(c.created_at).toLocaleString()}):<br />
                        {c.body}
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
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

            // Supabase v2 は data:any[] | null なのでキャスト
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
            filter: `wiki_slug=eq.${wikiSlug},page_slug=eq.${pageSlug}`,
            },
            (payload: { new: Comment }) => {
            setComments(prev => [...prev, payload.new])
            }
        )
        .subscribe()

        // ── クリーンアップ ──
        return () => {
            supabase.removeChannel(channel)
        }
    }, [wikiSlug, pageSlug])

    return (
        <ul>
        {comments.map(c => (
            <li key={c.id}>
            <strong>{c.name}</strong> ({new Date(c.created_at).toLocaleString()}):
            <br />
            {c.body}
            </li>
        ))}
        </ul>
    )
}
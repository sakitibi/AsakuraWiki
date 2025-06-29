import React, { useEffect, useState } from 'react'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

// 方法①（おすすめ）：注釈を外して推論に任せる
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

export default function RealTimeComments({
    wikiSlug,
    pageSlug
}: {
    wikiSlug: string
    pageSlug: string
}) {
    const [comments, setComments] = useState<Comment[]>([])

    useEffect(() => {
        if (!wikiSlug || !pageSlug) return

        // 初回ロード
    ;(async () => {
        // from の型引数を外し、結果を Comment[] として扱う
        const res = await supabase
            .from('comments')
            .select('*')
            .eq('wiki_slug', wikiSlug)
            .eq('page_slug', pageSlug)
            .order('created_at', { ascending: true })

        // data は any[] | null なので、自前で Comment[] にキャスト
        const data = res.data as Comment[] | null
        setComments(data || [])
    })()

        // リアルタイム購読のセットアップ
        const channel: RealtimeChannel = supabase
        .channel(`comments-${wikiSlug}-${pageSlug}`)
        .on(
            'postgres_changes',
            {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `wiki_slug=eq.${wikiSlug},page_slug=eq.${pageSlug}`
            },
            (payload: { new: Comment }) => {
            setComments(prev => [...prev, payload.new])
            }
        )
        .subscribe()

        // クリーンアップ
        return () => {
            supabase.removeChannel(channel)
        }
    }, [wikiSlug, pageSlug])

    return (
        <ul>
        {comments.map(c => (
            <li key={c.id}>
            <strong>{c.name}</strong>: {c.body}
            </li>
        ))}
        </ul>
    )
}
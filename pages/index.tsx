import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type WikiPage = {
    slug: string;
    name: string;
    updated_at: string;
};

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPages() {
            const { data, error } = await supabase
                .from('wiki_pages')
                .select('slug, title, updated_at, wikis(name)')
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching wiki pages:', error.message);
            } else {
                const flattened: WikiPage[] = data.map((d: any) => ({
                    slug: d.slug,
                    name: d.wikis?.[0]?.name ?? '(無名Wiki)',  // ← 配列対応に修正
                    updated_at: d.updated_at,
                }));
                setPages(flattened);
            }

            console.log('fetchPages data:', data);
            console.log('fetchPages error:', error);

            setLoading(false);
        }

        fetchPages();
    }, []);

    const NewWikiPage = () => {
        location.href = "/dashboard/create-wiki";
    }

    return (
        <>
            <main style={{ padding: '2rem' }}>
            <h1>AsakuraWiki</h1>
            <div id="now-update-wikis">
                {loading ? (
                    <p>Loading...</p>
                ) : pages.length === 0 ? (
                    <p>まだページがありません。</p>
                ) : (
                    <ul>
                    {pages.map((wiki) => (
                    <li key={wiki.slug}>
                        <Link href={`/wiki/${wiki.slug}`}>
                        <button>
                            <span>
                            <strong>{wiki.name} Wiki*</strong>
                            </span>
                        </button>
                        </Link>{' '}
                        <small>（{new Date(wiki.updated_at).toLocaleString()}）</small>
                    </li>
                    ))}
                    </ul>
                )}
            </div>
            <br />
                <button onClick={NewWikiPage}><span>＋ 新しいWikiを作る</span></button>
            </main>
            <footer style={{textAlign: "center"}}>
                <p>Copyright 2025 13ninstudio All rights Reserved</p>
                <p>当Wikiサービスはオープンソースプロジェクトです</p>
            </footer>
        </>
    );
}
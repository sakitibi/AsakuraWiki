import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type WikiPage = {
    slug: string;
    title: string;
    updated_at: string;
};

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPages() {
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('slug, title, updated_at')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching wiki pages:', error.message);
        } else {
            setPages(data);
        }

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
                    {pages.map((page) => (
                        <li key={page.slug}>
                        <Link href={`/wiki/${page.slug}`}>
                            <button>
                                <span>
                                    <strong>{page.title} Wiki*</strong>
                                </span>
                            </button>
                        </Link>{' '}
                        <small>（{new Date(page.updated_at).toLocaleString()}）</small>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
            <br />
                <button onClick={NewWikiPage}><span>＋ 新しいWikiを作る</span></button>
            </main>
        </>
    );
}
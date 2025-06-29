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
    // 追加（必要なら）
    wikiSlug?: string;
    pageSlug?: string;
};

export default function Home() {
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPages() {
        // 例: fk_wiki_slug という名前のリレーションを使う場合
        const { data, error } = await supabase
            .from('wiki_pages')
            .select('slug, title, updated_at, page_slug, wiki_slug, wikis!fk_wiki_slug(name, slug)') // slugも指定
            .order('updated_at', { ascending: false });

            if (!error && data) {
            const flattened: WikiPage[] = data.map((d: any) => ({
                slug: d.slug,
                name: d.wikis?.name ?? '(無名Wiki)',
                updated_at: d.updated_at,
                pageSlug: d.page_slug,
                wikiSlug: d.wikis?.slug ?? '',   // ここで親Wikiのslugをセット
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
                        <Link href={`/wiki/${wiki.wikiSlug}/${wiki.pageSlug || 'home'}`}>
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
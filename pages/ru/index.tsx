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
            const { data, error } = await supabase
            .from('wiki_pages')
            .select('slug, title, updated_at, wiki_slug, wikis!fk_wiki_slug(name, slug)')
            .order('updated_at', { ascending: false });

            console.log('fetchPages data:', data);
            console.log('fetchPages error:', error);

            if (!error && data) {
            const flattened: WikiPage[] = data.map((d: any) => ({
                slug: d.slug,
                name: d.wikis?.name ?? '(анонимный вики)',
                updated_at: d.updated_at,
                pageSlug: d.slug,    // ここは `slug` で代用
                wikiSlug: d.wikis?.slug ?? '',
            }));
                console.log('flattened:', flattened);
                setPages(flattened);
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
            <h1>АсакураWiki</h1>
            <div id="now-update-wikis">
                {loading ? (
                    <p>Loading...</p>
                ) : pages.length === 0 ? (
                    <p>Страниц пока нет.</p>
                ) : (
                    <ul>
                    {pages.map((wiki) => (
                    <li key={wiki.slug}>
                        <Link href={`/wiki/${wiki.wikiSlug}/${wiki.pageSlug || 'FrontPage'}`}>
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
                <button onClick={NewWikiPage}><span>+ Создать новую Вики (японский)</span></button>
            </main>
            <footer>
                <div id="menu">
                    <ul>
                        <li>
                            <Link href="/ru">
                                <button><span>Дом</span></button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/ru/about">
                                <button><span>Об этом вики-сайте по аренде</span></button>
                            </Link>
                        </li>
                        <li>
                            <Link href="/"><button><span>японский</span></button></Link>
                        </li>
                    </ul>
                </div>
                <div style={{textAlign: "center"}}>
                    <p>Copyright 2025 13ninstudio All rights Reserved</p>
                    <p>Этот Wiki-сервис — проект с открытым исходным кодом.</p>
                </div>
            </footer>
        </>
    );
}
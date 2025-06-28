import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

type Page = {
    title: string;
    content: string;
};

export default function WikiPage() {
    const router = useRouter();
    const { slug } = router.query;
    const [page, setPage] = useState<Page | null>(null);
    const [error, setError] = useState<string | null>(null);

    // slugが配列の場合は結合
    const slugStr = Array.isArray(slug) ? slug.join('/') : slug;

    useEffect(() => {
        if (!slugStr) return;

        const fetchPage = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wiki/${slugStr}`);
                if (!res.ok) throw new Error(`ページ取得エラー: ${res.status}`);
                const data = await res.json();
                setPage(data);
                setError(null);
            } catch (e: any) {
                setError(e.message || '不明なエラー');
            }
        };

        fetchPage();
    }, [slugStr]);

    const handleEdit = () => {
        router.push(`/wiki/${slugStr}/::cmd/edit`);
    };

    function parseAccordion(content: string): string {
        return content.replace(
            /#accordion\(([^,]+),(\*{1,3}),(open|close)\)\s*\{\{([\s\S]*?)\}\}/g,
            (_, title, level, state, body) => {
                const openAttr = state === 'open' ? 'open' : '';
                const headingTag = level === '*' ? 'h3' : level === '**' ? 'h4' : 'h5';
                return `
                    <details ${openAttr}>
                        <summary><${headingTag}>${title}</${headingTag}></summary>
                        <div>${body.trim().replace(/\n/g, '<br>')}</div>
                    </details>
                `;
            }
        );
    }

    if (error) return <div style={{ color: 'red' }}>エラー: {error}</div>;
    if (!page) return <div>読み込み中...</div>;

    return (
        <>
            <Head>
                <title>{page.title}</title>
            </Head>
            <div>
                <div dangerouslySetInnerHTML={{ __html: parseAccordion(page.content) }} />
                <br />
                <button onClick={handleEdit}><span>このページを編集</span></button>
            </div>
        </>
    );
}
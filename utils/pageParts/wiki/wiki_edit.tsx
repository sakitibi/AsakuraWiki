import React from "react";
import { special_wiki_list } from "@/utils/wiki_list";

interface WikiEditPageProps{
    handleUpdate: (e: React.FormEvent<Element>) => Promise<void>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    parsedPreview: React.ReactNode[] | null;
    loading: boolean;
    wikiSlugStr: string;
    pageSlugStr: string;
}

export default function WikiEditPage({
    handleUpdate,
    title,
    setTitle,
    content,
    setContent,
    parsedPreview,
    loading,
    wikiSlugStr,
    pageSlugStr
}: WikiEditPageProps){
    return(
        <main style={{ padding: '2rem', maxWidth: 600 }}>
            <h1>📝 ページ編集</h1>
            <form onSubmit={handleUpdate}>
                <label>
                タイトル:
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ width: '100%', margin: '8px 0', padding: 6 }}
                />
                </label>
                <label>
                内容:
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{ width: '100%', height: 300, padding: 6 }}
                    autoFocus
                />
                </label>
                <h2>プレビュー：</h2>
                <div
                style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    background: '#f9f9f9',
                    minHeight: 100,
                }}
                >
                {parsedPreview?.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                ))}
                </div>
                <button
                type="submit"
                disabled={
                    loading ||
                    (wikiSlugStr === special_wiki_list[0] && pageSlugStr !== 'sinsei')
                }
                style={{ marginTop: 12, padding: '0.6rem 1.2rem' }}
                >
                    <span>{loading ? '保存中…' : '保存'}</span>
                </button>
            </form>
        </main>
    )
}
import React from "react";
import { special_wiki_list } from "@/utils/wiki_list";
import { handleUpdate } from "@/utils/pageParts/wiki/wiki_handler";
import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { NextRouter } from "next/router";
import styles from '@/css/wikis.module.css';

interface WikiEditPageProps{
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    setContent: React.Dispatch<React.SetStateAction<string>>;
    parsedPreview: React.ReactNode[] | null;
    loading: boolean;
    wikiSlugStr: string;
    pageSlugStr: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    editMode: editMode;
    user: User | null;
    router: NextRouter;
}

export default function WikiEditPage({
    title,
    setTitle,
    content,
    setContent,
    parsedPreview,
    loading,
    wikiSlugStr,
    pageSlugStr,
    setLoading,
    editMode,
    user,
    router
}: WikiEditPageProps){
    return(
        <div id="contents-wrapper" style={{display: 'flex'}}>
            <div className={styles.container} style={{display: 'grid', gridTemplateColumns: "1fr"}}>
                <article style={{ padding: '2rem', maxWidth: 1000 }} className={`columnCenter ${styles.clearfix}`}>
                    <h1>
                        <i className="fa-solid fa-file-pen"></i>
                        ページ編集
                    </h1>
                    <form onSubmit={(e:React.FormEvent) => {
                        e.preventDefault();
                        handleUpdate(
                            setLoading,
                            editMode,
                            user,
                            wikiSlugStr,
                            pageSlugStr,
                            title,
                            content,
                            router
                        );
                    }}>
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
                </article>
            </div>
        </div>
    )
}
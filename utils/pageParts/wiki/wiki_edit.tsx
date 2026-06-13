import React, { useRef } from "react";
import { special_wiki_list } from "@/utils/wiki_list";
import { handleUpdate } from "@/utils/pageParts/wiki/wiki_handler";
import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { NextRouter } from "next/router";
import Editor, { Monaco } from "@monaco-editor/react";

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
    router,
}: WikiEditPageProps){
    const editorRef = useRef<any>(null);

    const handleEditorBeforeMount = (monaco: Monaco) => {
        const languageId = "AsakuraWikiScript";
        
        monaco.languages.register({ id: languageId });

        monaco.languages.setMonarchTokensProvider(languageId, {
            tokenizer: {
                root: [
                    [/^\*\*\*/, "keyword.h3"],
                    [/^\*\*/, "keyword.h2"],
                    [/^\*/, "keyword.h1"],
                ],
            },
        });

        monaco.editor.defineTheme("AsakuraWikiTheme", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "keyword.h3", foreground: "#3300ff", fontStyle: "bold" }, 
                { token: "keyword.h2", foreground: "#00805e", fontStyle: "bold" },
                { token: "keyword.h1", foreground: "#4ec9b0", fontStyle: "bold" },
            ],
            colors: {},
        });
    };

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monaco.editor.setTheme("AsakuraWikiTheme");
    };

    return(
        <div id="contents-wrapper" style={{display: 'flex'}}>
            <div className="wikieditor-container" style={{display: 'grid', gridTemplateColumns: "1fr"}}>
                <article style={{ padding: '2rem' }} className="columnCenter clearfix">
                    <h1>
                        <i className="fa-solid fa-file-pen"></i>
                        ページ編集
                    </h1>
                    <form
                        onSubmit={(e:React.SubmitEvent) => {
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
                        }}
                        id="wikipage_editorform"
                    >
                        <label>
                        タイトル:
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', margin: '8px 0', padding: 6 }}
                        />
                        </label>
                        
                        <label style={{ display: 'block', marginBottom: '8px' }}>内容:</label>
                        <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                            <Editor
                                height="300px"
                                language="AsakuraWikiScript"
                                theme="AsakuraWikiTheme"
                                value={content}
                                onChange={(value) => setContent(value || "")}
                                beforeMount={handleEditorBeforeMount}
                                onMount={handleEditorDidMount}
                                options={{
                                    minimap: { enabled: false },
                                    wordWrap: "on",
                                    fontSize: 14,
                                    lineNumbers: "on",
                                }}
                            />
                        </div>

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
                            <span>{loading ? '更新中…' : '更新'}</span>
                        </button>
                    </form>
                </article>
            </div>
        </div>
    )
}
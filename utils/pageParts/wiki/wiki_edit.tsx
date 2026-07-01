import React, { useEffect, useRef, useState } from "react";
import { special_wiki_list } from "@/utils/wiki_list";
import { handleUpdate } from "@/utils/pageParts/wiki/wiki_handler";
import { editMode } from "@/utils/wiki_settings";
import { User } from "@supabase/supabase-js";
import { NextRouter } from "next/router";
import Editor, { Monaco } from "@monaco-editor/react";
import { ScaptchaSessionProps } from "@/pages/login";

interface WikiEditPageProps{
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    content: string;
    beforeContent: string;
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

export const handleEditorBeforeMount = (monaco: Monaco) => {
    const languageId = "AsakuraWikiScript";
    
    monaco.languages.register({ id: languageId });

    monaco.languages.setMonarchTokensProvider(languageId, {
        tokenizer: {
            root: [
                // 見出し (行頭の * )
                [/^\*\*\*/, "keyword.h3"],
                [/^\*\*/, "keyword.h2"],
                [/^\*/, "keyword.h1"],

                [/^#(const|let)\b/, "keyword.variable-def"],

                [/&(const-use|let-use|relet)\b/, "variable.variable-use"],

                [/^#(marquee|calendar2|datedif|datevalue|rtcomment|comment|hr|br|ls2|ls|include|contents|func)\b/, "keyword.plugin"],
                
                [/^(CENTER|LEFT|RIGHT):/, "keyword.align"],

                [/&(size|color|attachref|escape|calc|version|new|br|arg|return)\b/, "variable.inline-plugin"],

                [/\[\[[^\]]+\]\]/, "string.link"],
            ],
        },
    });

    monaco.editor.defineTheme("AsakuraWikiTheme", {
        base: "vs-dark",
        inherit: true,
        rules: [
            // 見出し設定
            { token: "keyword.h3", foreground: "#3300ff", fontStyle: "bold" }, 
            { token: "keyword.h2", foreground: "#00805e", fontStyle: "bold" },
            { token: "keyword.h1", foreground: "#4ec9b0", fontStyle: "bold" },

            { token: "keyword.variable-def", foreground: "#4FC1FF", fontStyle: "bold" }, // 定義は太字
            { token: "variable.variable-use", foreground: "#9CDCFE" },                   // 使用は通常のライトブルー

            // 通常のプラグイン設定
            { token: "keyword.plugin", foreground: "#C586C0", fontStyle: "bold" },      
            { token: "keyword.align", foreground: "#E5C07B" },                            
            { token: "variable.inline-plugin", foreground: "#DCDCAA" },                   
            { token: "string.link", foreground: "#CE9178", fontStyle: "underline" },      
        ],
        colors: {},
    });
};

export default function WikiEditPage({
    title,
    setTitle,
    content,
    beforeContent,
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
    const [scaptcha_params, setScaptcha_params] = useState<string | null>(null);
    const [scaptcha_session, setScaptcha_session] = useState<ScaptchaSessionProps | null>(null);
    const [isenabled, setIsenabled] = useState<boolean | null>(null);
    
    useEffect(() => {
        const params = localStorage.getItem("scaptcha_params");
        setScaptcha_params(params);
    }, []);
    
    useEffect(() => {
        if (!scaptcha_params) return;
        (async function(){
            const res = await fetch("/api/scaptcha/token", {
                method: "GET",
                headers: {
                    "x-scaptcha-session": scaptcha_params!
                }
            });
            if (!res.ok) {
                console.error("Error scaptcha tokenget failed.");
                return;
            }
            setScaptcha_session(await res.json());
        })();
    }, [scaptcha_params]);

    useEffect(() => {
        if (!scaptcha_session || !scaptcha_params) {
            setIsenabled(false);
            return;
        }
        const date = new Date(scaptcha_session?.created_at).getTime();
        const now = new Date().getTime();
        (async function(){
            if (now > date + 18e5) {
                setIsenabled(false);
                const res = await fetch("/api/scaptcha/token", {
                    method: "DELETE",
                    headers: {
                        "x-scaptcha-session": scaptcha_params
                    }
                });
                localStorage.removeItem("scaptcha_params");
                if (!res.ok) {
                    console.error("Error delete failed.");
                }
                return;
            } else {
                localStorage.setItem("scaptcha_params", scaptcha_params);
                setIsenabled(true);
            }
        })();
    }, [scaptcha_session]);

    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monaco.editor.setTheme("AsakuraWikiTheme");
    };

    return(
        <div id="contents-wrapper">
            <div className="wikieditor-container">
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
                        <div style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '16px'
                        }}>
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
                            (wikiSlugStr === special_wiki_list[0] && pageSlugStr !== 'sinsei') ||
                            !isenabled ||
                            (content === beforeContent)
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
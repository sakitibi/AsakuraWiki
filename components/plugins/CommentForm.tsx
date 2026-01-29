import { supabaseClient } from '@/lib/supabaseClient';
import { hexByteaToUint8Array } from '@/utils/wikiFetch';
import Pako from 'pako';
import React, { useState } from 'react';

interface CommentFormProps {
    wikiSlug: string;
    pageSlug: string;
    position: 'above' | 'below';
};

export default function CommentForm({
    wikiSlug,
    pageSlug,
    position,
}: CommentFormProps) {
    const [name, setName] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        try{
            e.preventDefault();
            setLoading(true);

            const commentLine = `- ${body} -- ${name} &new{&now;};`;

            // ページ情報取得
            const { data: pageData, error: pageError } = await supabaseClient
                .from('wiki_pages')
                .select('title, content')
                .eq('wiki_slug', wikiSlug)
                .eq('slug', pageSlug)
                .maybeSingle();

            if (pageError || !pageData) {
                console.log('ページの読み込みに失敗しました', pageError?.message);
                return;
            }

            // bytea(base64) → Uint8Array → gunzip
            const compressed = hexByteaToUint8Array(pageData.content);
            const decompressed = Pako.ungzip(compressed, { to: "string" });
            const content = decompressed;
            const title = pageData.title;
            console.log("content: ", content, "title: ", title);

            // #comment の位置を探す
            const commentRegex = /#comment(?:\(\s*(above|below)\s*\))?/;
            const match = content.match(commentRegex);

            if (!match) {
                console.error("content 内に #comment が見つかりません");
                return;
            }

            const index = match.index!;
            const tokenLength = match[0].length;

            let updatedContent = '';

            if (position === 'above') {
                updatedContent =
                    content.slice(0, index) +
                    commentLine + "\n" +
                    content.slice(index);
            } else {
                updatedContent =
                    content.slice(0, index + tokenLength) +
                    "\n" + commentLine +
                    content.slice(index + tokenLength);
            }

            // PUT 更新
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;

            await fetch(`/api/wiki/${wikiSlug}/${pageSlug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content: updatedContent,
                }),
            });

            setBody('');
            setLoading(false);
        } catch(e){
            console.error("#comment Submit Error: ", e);
        } finally{
            setLoading(false);
        }
    };

    return (
        <div id="commentform-container">
            <form onSubmit={handleSubmit} style={{ margin: '1em 0' }}>
                <label>
                    名前:
                    <input type="text" value={name} onChange={e => setName(e.target.value ?? "")}/>
                </label>
                <br />
                <label>
                    コメント:
                    <textarea value={body} onChange={e => setBody(e.target.value)} required></textarea>
                </label>
                <br />
                <button
                    type="submit"
                    className="comment-submit"
                    disabled={loading}
                >
                    <span>
                        {loading ? "送信中" : "送信"}
                    </span>
                </button>
            </form>
        </div>
    );
}

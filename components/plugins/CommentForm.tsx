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
    const [currentContent, setContent] = useState<string>('');
    const [currentTitle, setTitle] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const commentLine = `- ${body} -- ${name} &now();`;

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
        } else {
            // bytea(base64) → Uint8Array → gunzip
            const compressed = hexByteaToUint8Array(pageData.content);
            const decompressed = Pako.ungzip(compressed, { to: "string" });

            const pageDataResult = {
                ...pageData,
                content: decompressed
            };
            setTitle(pageDataResult.title);
            setContent(pageDataResult.content);
        }

        // #comment の位置を探す
        const commentRegex = /#comment(?:\(\s*(above|below)\s*\))?/;
        const match = currentContent.match(commentRegex);

        if (!match) {
            console.error("content 内に #comment が見つかりません");
            return;
        }

        const index = match.index!;
        const tokenLength = match[0].length;

        let updatedContent = '';

        if (position === 'above') {
            updatedContent =
                currentContent.slice(0, index) +
                commentLine + "\n" +
                currentContent.slice(index);
        } else {
            updatedContent =
                currentContent.slice(0, index + tokenLength) +
                "\n" + commentLine +
                currentContent.slice(index + tokenLength);
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
                title: currentTitle,
                content: updatedContent,
            }),
        });

        setBody('');
    };

    return (
        <div id="commentform-container">
            <form onSubmit={handleSubmit} style={{ margin: '1em 0' }}>
                <label>
                    名前:
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </label>
                <br />
                <label>
                    コメント:
                    <textarea value={body} onChange={e => setBody(e.target.value)} required ></textarea>
                </label>
                <br />
                <button type="submit" className="comment-submit"><span>送信</span></button>
            </form>
        </div>
    );
}

import { supabaseClient } from '@/lib/supabaseClient';
import Pako from 'pako';
import React, { useState } from 'react';

interface CommentFormProps {
    wikiSlug: string;
    pageSlug: string;
    position: 'above' | 'below';
};

/**
 * Base64文字列をUint8Arrayに変換（Blobデータ用）
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

export default function CommentForm({
    wikiSlug,
    pageSlug,
    position,
}: CommentFormProps) {
    const [name, setName] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            setLoading(true);

            // コメント行の生成
            const commentLine = `- ${body} -- ${name} &new{&now;};`;

            // 1. API v2 から現在のページデータを取得
            const response = await fetch(`/api/wiki_v2/${wikiSlug}/${pageSlug}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.error('ページの取得に失敗しました');
                return;
            }

            const pageData = await response.json();

            // 2. Base64 + Gzip を解凍してテキスト化
            const compressed = base64ToUint8Array(pageData.content);
            const decompressed = Pako.ungzip(compressed, { to: "string" });
            const content = decompressed;
            const title = pageData.title;

            // 3. #comment の位置を探して挿入
            const commentRegex = /#comment(?:\(\s*(above|below)\s*\))?/;
            const match = content.match(commentRegex);

            if (!match) {
                console.error("コンテンツ内に #comment が見つかりません");
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

            // 4. API v2 (PUT) で更新を実行
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;

            const updateRes = await fetch(`/api/wiki_v2/${wikiSlug}/${pageSlug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content: updatedContent, // API側で圧縮するので生テキストを送る
                }),
            });

            if (!updateRes.ok) {
                throw new Error('更新に失敗しました');
            }

            // フォームの初期化
            setBody('');
            // 必要に応じてページのリロードや状態更新のトリガーをここに入れる
            window.location.reload(); 

        } catch (e) {
            console.error("#comment Submit Error: ", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="commentform-container">
            <form onSubmit={handleSubmit} style={{ margin: '1em 0' }}>
                <div style={{ marginBottom: '8px' }}>
                    <label>
                        名前: 
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            style={{ marginLeft: '8px' }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block' }}>コメント:</label>
                    <textarea 
                        value={body} 
                        onChange={e => setBody(e.target.value)} 
                        required 
                        style={{ width: '100%', minHeight: '60px' }}
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="comment-submit"
                    disabled={loading}
                >
                    <span>
                        {loading ? "送信中..." : "コメント送信"}
                    </span>
                </button>
            </form>
        </div>
    );
}
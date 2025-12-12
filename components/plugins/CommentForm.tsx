import React, { useState } from 'react';

export default function CommentForm() {
    const [name, setName] = useState<string>('');
    const [body, setBody] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Supabase などに保存するロジック
        console.log({ name, body });
    };

    return (
        <div id="commentform-container">
            <form onSubmit={handleSubmit} style={{ margin: '1em 0' }}>
                <label>
                名前:
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                </label>
                <br />
                <label>
                コメント:
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    required
                ></textarea>
                </label>
                <br />
                <button type="submit" className="comment-submit"><span>送信</span></button>
            </form>
        </div>
    );
}
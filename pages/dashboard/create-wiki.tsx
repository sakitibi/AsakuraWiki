import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { supabaseClient } from '@/lib/supabaseClient';
import { ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import Head from 'next/head';
import { User } from '@supabase/supabase-js';

export default function CreateWikiPage() {
    const [wikiId, setWikiId] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [agreeASKR, setAgreeASKR] = useState<boolean>(false);
    const [agree13nin, setAgree13nin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const router: NextRouter = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data }) => {
            if (data.user) setUser(data.user);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeASKR || !agree13nin) {
            alert('利用規約に同意してください。');
            return;
        }
        if (!user) {
            alert('ログインしてください');
            return;
        }

        setLoading(true);

        const slug: string = wikiId.trim().toLowerCase();

        // 禁止リストチェック
        if (deleted_wiki_list.includes(slug) || ban_wiki_list.includes(slug)) {
            alert("このWiki IDは使用できません。");
            setLoading(false);
            return;
        }

        try {
            // 1) wikis テーブルに挿入 (Supabase)
            // メタデータ（所有者や設定）は引き続きDBで管理
            const { error: wikiError } = await supabaseClient
                .from('wikis')
                .insert([{
                    slug,
                    name: title,
                    description,
                    owner_id: user.id,
                    edit_mode: 'public',
                    created_at: new Date(),
                    updated_at: new Date(),
                    cli_used: true,
                }]);

            if (wikiError) {
                throw new Error('Wikiの基本情報作成に失敗しました: ' + wikiError.message);
            }

            // 2) FrontPage を Vercel Blob に作成 (API v2 呼び出し)
            // セッショントークンの取得
            const { data: { session } } = await supabaseClient.auth.getSession();
            const token = session?.access_token;

            // API v2 へ POST リクエストを送る
            // POST は新規作成用として実装しているため、これを使用します
            const res = await fetch(`/api/wiki_v2/${slug}/FrontPage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: 'FrontPage',
                    content: `* ${title} Wiki* へようこそ！\n\nここは新しいWikiのホームページです。`,
                    slug: 'FrontPage' // POST時に必要な場合
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Blob creation error:', errorData);
                // Wiki自体はできているので、エラーを表示しつつ移動はさせる
                alert('初期ページの作成に失敗しましたが、Wikiは作成されました。');
            }

            // 成功したらWikiトップへ
            router.push(`/wiki/${slug}`);

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>新しいWikiを作る</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 600 }}>
                {user ? (
                    <>
                        <h1>新しいWikiを作る</h1>
                        <form onSubmit={handleSubmit}>
                            {/* ... (既存のフォーム内容) ... */}
                            <label>
                                Wiki ID（変更できません）:
                                <input
                                    value={wikiId}
                                    onChange={(e) => setWikiId(e.target.value)}
                                    required
                                    pattern="^[a-z0-9\-_]+$"
                                    placeholder="example"
                                    style={{ width: '100%' }}
                                />
                            </label>
                            <br /><br />
                            <label>
                                Wikiタイトル:
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </label>
                            <br /><br />
                            <label>
                                説明:
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ width: '100%', height: 80 }}
                                />
                            </label>
                            <br /><br />
                            <label>
                                <input type="checkbox" checked={agreeASKR} onChange={(e) => setAgreeASKR(e.target.checked)} required />
                                <a href='/policies' target='_blank'>あさクラWiki利用規約</a>に同意します
                            </label>
                            <br/><br/>
                            <label>
                                <input type="checkbox" checked={agree13nin} onChange={(e) => setAgree13nin(e.target.checked)} required />
                                <a href='https://sakitibi-com9.webnode.jp/page/10' target='_blank'>13nin利用規約</a>に同意します
                            </label>
                            <br/><br/>
                            <button type="submit" disabled={loading}>
                                <span>{loading ? '作成中…' : 'Wikiを作成'}</span>
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h1>Error 403 Forbidden</h1>
                        <p><a href='/login'>13ninアカウントにログインして下さい</a></p>
                    </>
                )}
            </main>
        </>
    );
}
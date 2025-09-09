import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseServer } from 'lib/supabaseClientServer';
import { ban_wiki_list, deleted_wiki_list } from '@/utils/wiki_list';
import Head from 'next/head';

export default function CreateWikiPage() {
    const [wikiId, setWikiId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [agreeASKR, setAgreeASKR] = useState(false);
    const [agree13nin, setAgree13nin] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreeASKR || !agree13nin) {
            alert('利用規約に同意してください。');
            return;
        }
        setLoading(true);

        // ログインユーザー取得
        const { data: { user } } = await supabaseServer.auth.getUser();
        if (!user) {
            alert('ログインしてください');
            setLoading(false);
            return;
        }
        const slug = wikiId.trim().toLowerCase();
        const deleted_wiki_list_found = deleted_wiki_list.find(value => value === slug);
        const ban_wiki_list_found = ban_wiki_list.find(value => value === slug);

        if(deleted_wiki_list_found || ban_wiki_list_found){
            alert("このWikiは過去に一度作成されていました、");
            setLoading(false);
            return;
        }

        // 1) wikis テーブルに挿入
        const {error: wikiError} = await supabaseServer
            .from('wikis')
            .insert([{
                slug,
                name: title,
                description,
                owner_id: user.id,
                edit_mode: 'public',      // 初期値を決めておく
                created_at: new Date(),
                updated_at: new Date(),
                cli_used: true,
            }])
            .select()
            .single();

        if (wikiError) {
            alert('Wiki本体の作成に失敗しました: ' + wikiError.message);
            setLoading(false);
            return;
        }

        // 2) wiki_pages テーブルに「ホーム」ページを挿入（お好みで）
        // 例：ホームページのslugは固定で "FrontPage" にする
        // ホームページを作成する例
        const { error: pageError } = await supabaseServer
        .from('wiki_pages')
        .insert([{
            wiki_slug: slug,    // 親Wikiのslugを外部キーで指定
            slug: 'FrontPage',       // ページごとのslug
            title: 'ホーム',
            content: 'ようこそ！',
            created_at: new Date(),
            updated_at: new Date(),
        }]);

        if (pageError) {
            // ここはエラーでもWiki自体は作成済みなので、ログに残す程度か再試行を促す
            console.error('wiki_pages insert error:', pageError);
        }

        setLoading(false);
        router.push(`/wiki/${slug}`);
    };

    return (
        <>
            <Head>
                <title>新しいWikiを作る</title>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 600 }}>
                <h1>新しいWikiを作る</h1>
                <form onSubmit={handleSubmit}>
                    <label>
                    Wiki ID（変更できません）:
                    <input
                        value={wikiId}
                        onChange={(e) => setWikiId(e.target.value)}
                        required
                        pattern="^[a-z0-9\-_]+$"
                        title="小文字の英数字とハイフンとアンダーバーのみ使用できます"
                        placeholder="例: example"
                        style={{ width: '100%' }}
                    />
                    </label>
                    <br /><br />
                    <label>
                    Wikiタイトル（変更可能）:
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
                    <input
                        type="checkbox"
                        checked={agreeASKR}
                        onChange={(e) => setAgreeASKR(e.target.checked)}
                        required
                    />
                    <a href='/policies' target='_blank'>あさクラWiki利用規約</a>に同意します
                    </label>
                    <br/><br/>
                    <label>
                    <input
                        type="checkbox"
                        checked={agree13nin}
                        onChange={(e) => setAgree13nin(e.target.checked)}
                        required
                    />
                    <a href='https://sakitibi-com9.webnode.jp/page/10' target='_blank'>13nin利用規約</a>に同意します
                    </label>
                    <br/><br/>
                    <button type="submit" disabled={loading}>
                    <span>{loading ? '作成中…' : 'Wikiを作成'}</span>
                    </button>
                </form>
            </main>
        </>
    );
}
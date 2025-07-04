import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreateWikiPage() {
    const [wikiId, setWikiId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { alert('利用規約に同意してください。'); return; }
    setLoading(true);

    // ログインユーザー取得
    const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert('ログインしてください'); setLoading(false); return; }

        const slug = wikiId.trim().toLowerCase();

        // 1) wikis テーブルに挿入
        const {error: wikiError} = await supabase
            .from('wikis')
            .insert([{
                slug,
                name: title,
                description,
                owner_id: user.id,
                edit_mode: 'public',      // 初期値を決めておく
                created_at: new Date(),
                updated_at: new Date(),
            }])
            .select()
            .single();

        if (wikiError) {
            alert('Wiki本体の作成に失敗しました: ' + wikiError.message);
            setLoading(false);
            return;
        }

        // 2) wiki_pages テーブルに「ホーム」ページを挿入（お好みで）
        // 例：ホームページのslugは固定で "home" にする
        // ホームページを作成する例
        const { error: pageError } = await supabase
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
    const [verified, setVerified] = useState(false);
    useEffect(() => {
        grecaptcha.render('html_element', {
            sitekey: '6LdFaXcrAAAAAHSP8Y7wacDh3vX_7VkS0VqED0Jn',
            callback: (response:any) => {
                setVerified(true);
            }
        });
    }, []);

    return (
        <main style={{ padding: '2rem', maxWidth: 600 }}>
        <h1>🆕 新しいWikiを作る</h1>
        <form onSubmit={handleSubmit}>
            <label>
            Wiki ID（変更できません）:
            <input
                value={wikiId}
                onChange={(e) => setWikiId(e.target.value)}
                required
                pattern="^[a-z0-9\-]+$"
                title="小文字の英数字とハイフンのみ使用できます"
                placeholder="例: my-wiki-id"
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
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
            />
            <a href='https://sakitibi-com9.webnode.jp/page/10' target='_blank'>利用規約</a>に同意します
            </label>
            <br /><br />
            <div id="recaptcha">
                {verified ? (
                    <section className="hero is-primary is-fullheight">
                    </section>
                ) : (
                    <section className="hero is-fullheight">
                        <div className="hero-body">
                            <div style={{
                                marginRight: 'auto',
                                marginLeft: 'auto',
                                textAlign: 'center',
                                width: '300px',
                                marginTop: '20px'
                            }}>
                                <div id="html_element"></div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
            <br/><br/>
            <button type="submit" disabled={loading}>
            <span>{loading ? '作成中…' : 'Wikiを作成'}</span>
            </button>
        </form>
        </main>
    );
}
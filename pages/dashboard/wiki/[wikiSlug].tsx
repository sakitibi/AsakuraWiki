import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import { supabaseServer } from 'lib/supabaseClientServer';

export default function WikiSettingsPage() {
    const router = useRouter();
    const { wikiSlug } = router.query;
    const user = useUser();

    // slug を文字列に正規化
    const slugStr = Array.isArray(wikiSlug) ? wikiSlug.join('/') : wikiSlug ?? '';
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editMode, setEditMode] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [type, setType] = useState<'wiki' | 'package'>('wiki');
    const [designColor, setdesignColor] = useState<'pink' | 'blue' | 'yellow' |'default'>('default');
    const [isCLI, setIsCLI] = useState<boolean>(true);

    useEffect(() => {
        if (!slugStr || !user) return;

        const fetchWiki = async () => {
            setLoading(true);
            const { data, error } = await supabaseServer
            .from('wikis')
            .select('name, description, owner_id, edit_mode, design_color, cli_used, type')
            .eq('slug', slugStr)
            .maybeSingle();

            if (error) {
                console.error('Supabase fetch error:', error);
                setErrorMsg('サーバーエラーが発生しました。');
                setLoading(false);
                return;
            }
            if (!data) {
                setErrorMsg('指定された Wiki は存在しません。');
                setLoading(false);
                return;
            }
            if (data.owner_id !== user.id) {
                setErrorMsg('この Wiki の管理者ではありません。');
                setLoading(false);
                return;
            }

            setName(data.name);
            setDescription(data.description);
            setEditMode(data.edit_mode === 'private' ? 'private' : 'public');
            setIsCLI(data.cli_used);
            setdesignColor(
                data.design_color === 'pink' ? 'pink' : 
                data.design_color === 'blue' ? 'blue' : 
                data.design_color === 'yellow' ? 'yellow': 
                'default'
            );
            setType(data.type);
            setLoading(false);
        };

        fetchWiki();
    }, [slugStr, user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabaseServer
        .from('wikis')
        .update({
            name,
            description,
            edit_mode: editMode,
            updated_at: new Date(),
            design_color: designColor,
            cli_used: isCLI,
            type: type
        })
        .eq('slug', slugStr);

        setLoading(false);

        if (error) {
            alert('更新に失敗しました: ' + error.message);
        } else {
            alert('設定を保存しました');
        }
    };

    const handleDelete = async () => {
        if (!confirm('本当にこのWikiを削除しますか？この操作は元に戻せません。')) return;

        setLoading(true);

        // 1. 子ページ（wiki_pages）を削除
        // wiki_pages 削除時は wiki_slug で親Wikiのページを一括削除
        const { error: pageError } = await supabaseServer
            .from('wiki_pages')
            .delete()
            .eq('wiki_slug', slugStr);  // ← 親Wikiのslugをキーに削除

        // wikis 削除はこれでOK
        const { error: wikiError } = await supabaseServer
            .from('wikis')
            .delete()
            .eq('slug', slugStr);

        const { error: deletionError } = await supabaseServer
            .from('deleted_wikis')
            /*.delete()
            .eq('slug', slugStr)*/
            .insert([{
                slug: slugStr,
                deleted: true
            }])
            .eq('slug', slugStr)
            .single()

        setLoading(false);

        if (pageError || wikiError || deletionError) {
            alert('削除に失敗しました: ' + (pageError?.message || wikiError?.message || deletionError?.message));
            return;
        }

        alert('Wikiを削除しました');
        router.push('/');
    };

    const isCLIChanges = () => {
        isCLI ? setIsCLI(false) : setIsCLI(true);
    }

    if (loading) return <p>読み込み中...</p>;

    return (
        <>
            <Head>
                <style jsx global>
                {`
                    /* start css */
                    #delete-wiki-button::before{
                        content: '';
                        position: absolute;
                        inset: 0;
                        z-index: 0;
                        background-image: linear-gradient(to left,rgb(103, 6, 6),rgb(219, 102, 102)) !important;
                        transition: filter 0.3s ease, transform 0.1s ease;
                    }
                    /* end css */
                `}
                </style>
            </Head>
            <main style={{ padding: '2rem', maxWidth: 600 }}>
                <h1>🔧 Wiki設定</h1>
                {errorMsg ? (
                    <p style={{ color: 'red' }}>{errorMsg}</p>
                ) : (
                    <div id="settings-container">
                        <form onSubmit={handleUpdate}>
                            <label>
                                Wikiタイトル:
                                <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%' }}
                                required
                                />
                            </label>
                            <br /><br />
                            <label>
                                説明:
                                <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ width: '100%', height: 100 }}
                                />
                            </label>
                            <br /><br />
                            <label>
                            編集モード:
                            <select
                                value={editMode}
                                onChange={(e) =>
                                    setEditMode(e.target.value as 'public' | 'private')
                                }
                                >
                                <option value="private">🔒 ログインユーザーのみ編集可</option>
                                <option value="public">🌐 誰でも編集可</option>
                            </select>
                            </label>
                            <br /><br />
                            <label>
                                デザイン:
                                <select
                                    value={designColor}
                                    onChange={(e) => 
                                        setdesignColor(e.target.value as 'pink' | 'blue' | 'yellow' |'default')
                                    }
                                    >
                                    <option value="default">デフォルト</option>
                                    <option value="pink">ピンク</option>
                                    <option value="blue">ブルー</option>
                                    <option value="yellow">イエロー</option>
                                </select>
                            </label>
                            <br /><br />
                            <label>
                                CLI EDITOR利用不可
                                <input
                                    type="radio"
                                    name="iscli"
                                    value="false"
                                    onChange={() => isCLIChanges()}
                                    checked={!isCLI}
                                />
                            </label>
                            <label>
                                CLI EDITOR利用可能
                                <input
                                    type="radio"
                                    name="iscli"
                                    value="true"
                                    onChange={() => isCLIChanges()}
                                    checked={isCLI}
                                />
                            </label>
                            <br /><br />
                            <p>プロジェクトタイプ:</p>
                            <label>
                                wiki
                                <input
                                    type="radio"
                                    name="project_type"
                                    value="wiki"
                                    checked
                                    onChange={(e) => setType(e.target.value as 'wiki' || 'project')}
                                />
                            </label>
                            <br/><br/>
                            <label>
                                package
                                <input
                                    type="radio"
                                    name="project_type"
                                    value="package"
                                    onChange={(e) => setType(e.target.value as 'wiki' || 'project')}
                                />
                            </label>
                            <br /><br />
                            <button type="submit" disabled={loading}>
                                <span>{loading ? '保存中…' : '保存'}</span>
                            </button>
                        </form>
                        <div style={{ marginTop: '2rem' }}>
                        <hr />
                        <br />
                        <button id='delete-wiki-button' onClick={handleDelete}><span>このWikiを削除する</span></button>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
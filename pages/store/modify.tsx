import Head from 'next/head';
import styles from '@/css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { DeveloperProps } from '@/pages/store/developer/[developer]';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabaseClient';

export default function Store() {
    const [loading, setLoading] = useState<boolean>(false);
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };

    const devFetch = async() => {
        try{
            const session = await supabaseClient.auth.getSession();
            const token = session?.data?.session?.access_token;
            const res:Response = await fetch("/api/store/developers", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if(!res.ok){
                console.error("Error: ", await res.json());
                return;
            }
            return await res.json();
        } catch(e){
            console.error("Error: ", e);
        }
    }

    const StorePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            const developerData: DeveloperProps = await devFetch();
            if (!developerData) {
                throw new Error("デベロッパデータが取得できません");
            }

            if (user.id !== developerData.user_id) {
                throw new Error("デベロッパ権限がありません");
            }

            const appidInput = (document.getElementById("appid") as HTMLInputElement).value;
            const fullAppId = `${developerData.developer_id}.${appidInput}`;

            const { error } = await supabaseClient
                .from("store.apps")
                .update({
                    developer: developerData.developer_name,
                    developer_siteurl: developerData.developer_siteurl,
                    developer_id: developerData.developer_id,
                    appicon_url: (document.getElementById("appicon") as HTMLInputElement).value,
                    download_url: (document.getElementById("appdownload") as HTMLInputElement).value,
                    app_title: (document.getElementById("apptitle") as HTMLInputElement).value,
                    app_description:
                        (document.getElementById("appdescription") as HTMLInputElement).value || null,
                    app_version: (document.getElementById("appversion") as HTMLInputElement).value,
                    update_at: new Date().toISOString().slice(0, 10),
                })
                // なりすまし対策
                .eq("id", user.id)
                // 更新対象特定
                .eq("developer_id", developerData.developer_id)
                .eq("appid", fullAppId);

            if (error) {
                console.error(error);
                alert("アプリケーションを更新できませんでした");
                return;
            }

            alert("更新完了");

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    const AppDelete = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const appid = window.prompt("削除するアプリケーションのIDを入力");
            if (!appid) return;

            const { error } = await supabaseClient
                .from("store.apps")
                .delete()
                .eq("id", user.id)        // 所有者チェック
                .eq("appid", appid);     // アプリ特定

            if (error) throw error;

            alert("削除完了");
            location.href = "/store";

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    return(
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>13ninGamesStoreに公開</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/store/modify" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            <h1>アプリケーションの更新</h1>
                            <form onSubmit={StorePublish}>
                                <label>
                                    アプリID
                                    <input type="text" id="appid" required/>
                                </label>
                                <br/><br/>
                                <label>
                                    アプリアイコンURL
                                    <input type="text" id="appicon" required/>
                                </label>
                                <br/><br/>
                                <label>
                                    アプリダウンロードURL
                                    <input type="text" id="appdownload" required/>
                                </label>
                                <br/><br/>
                                <label>
                                    アプリタイトル
                                    <input type="text" id="apptitle" required/>
                                </label>
                                <br/><br/>
                                <label>
                                    アプリの説明(任意)
                                    <input type="text" id="appdescription"/>
                                </label>
                                <br/><br/>
                                <label>
                                    アプリバージョン
                                    <input type="text" id="appversion" placeholder='1.0.1' required/>
                                </label>
                                <br/><br/>
                                <button type="submit" disabled={loading}>
                                    <span>アプリケーションを更新</span>
                                </button>
                            </form>
                            <button style={{ backgroundColor: "red" }} onClick={AppDelete}>
                                <span style={{ color: "white" }}>アプリケーションを削除</span>
                            </button>
                        </>
                    </main>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}

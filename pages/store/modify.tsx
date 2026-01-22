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

    const StorePublish = async(e:React.FormEvent) => {
        e.preventDefault();
        if(!document) return;
        setLoading(true);
        try{
            const developerData:DeveloperProps = await devFetch();
            if(!developerData){
                throw new Error("Error: デベロッパデータがnullです");
            }
            if(user?.id !== developerData.user_id){
                throw new Error("Error: デベロッパコンソール未登録です");
            }
            const appid = (document.getElementById("appid") as HTMLInputElement).value;
            const appicon = (document.getElementById("appicon") as HTMLInputElement).value;
            const appdownload = (document.getElementById("appdownload") as HTMLInputElement).value;
            const apptitle = (document.getElementById("apptitle") as HTMLInputElement).value;
            const appdescription = (document.getElementById("appdescription") as HTMLInputElement).value ?? null; // 任意項目
            const appversion = (document.getElementById("appversion") as HTMLInputElement).value;
            const { error } = await supabaseClient
                .from("store.apps")
                .update([{
                    appid: `${developerData.developer_id}.${appid}`,
                    developer: developerData.developer_name,
                    developer_siteurl: developerData.developer_siteurl,
                    developer_id: developerData.developer_id,
                    appicon_url: appicon,
                    download_url: appdownload,
                    app_title: apptitle,
                    app_description: appdescription ?? null,
                    app_version: appversion,
                    update_at: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
                }])
                .eq("appid", `${developerData.developer_id}.${appid}`)
                .eq("id", user.id)
                .single();
            if(error){
                alert("エラー アプリケーションを公開出来ませんでした");
                console.error("Error: ", error.message);
                return;
            }
        } catch(e){
            console.error("Error: ", e);
        } finally {
            setLoading(false);
        }
    }
    const AppDelete = async() => {
        try{
            setLoading(true);
            const { error } = await supabaseClient
                .from("store.apps")
                .delete()
                .eq("user_id", user?.id)
                .eq("appid", window.prompt("削除するアプリケーションのidを入力"))
            if(error){
                throw new Error(error.message);
            }
            alert("削除完了!");
            location.href = "/store";
        } catch(e){
            console.error("Error: ", e);
        }finally{
            setLoading(false);
        }
    }
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

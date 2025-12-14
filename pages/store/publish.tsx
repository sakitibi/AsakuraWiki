import Head from 'next/head';
import styles from 'css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import StoreUnopened from '@/utils/pageParts/top/jp/storeunOpened';
import { supabaseServer } from '@/lib/supabaseClientServer';
import { DeveloperProps } from '@/pages/store/developer/[developer]';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@supabase/auth-helpers-react';

export default function Store() {
    const [loading, setLoading] = useState<boolean>(false);
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [isSetup, setIsSetup] = useState<boolean>(false);
    const user:User | null = useUser();
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
            const session = await supabaseServer.auth.getSession();
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
            const { error } = await supabaseServer
                .from("store.apps")
                .insert([{
                    appid: `${developerData.developer_id}.${appid}`,
                    developer: developerData.developer_name,
                    developer_siteurl: developerData.developer_siteurl,
                    official: false,
                    review: 3,
                    appicon_url: appicon,
                    download_url: appdownload,
                    app_title: apptitle,
                    app_description: appdescription ?? null,
                    app_version: appversion,
                    update_at: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
                }])
                .select()
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

    const targetDate = new Date('2025-12-18 00:00:00');
    useEffect(() => {
        const currentDate = new Date();
        setIsSetup(currentDate < targetDate);
    }, []);

    return !isSetup ? (
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>13ninGamesStore</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/store/publish/" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            <h1>アプリケーションの公開</h1>
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
                                    <input type="text" id="appversion" placeholder='1.0.0' required/>
                                </label>
                                <br/><br/>
                                <button type="submit" disabled={loading}>
                                    <span>アプリケーションを公開</span>
                                </button>
                            </form>
                        </>
                    </main>
                </div>
                <FooterJp/>
            </div>
        </>
    ) : (
        <StoreUnopened/>
    );
}

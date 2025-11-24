import Head from 'next/head';
import styles from 'css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import StoreUnopened from '@/utils/pageParts/top/jp/storeunOpened';
import { User, useUser } from '@supabase/auth-helpers-react';
import { AppProps } from '@/pages/store/details/[appDetails]';
import { supabaseServer } from '@/lib/supabaseClientServer';

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [isSetup, setIsSetup] = useState(false);
    const user:User | null = useUser();
    const handleClick = () => {
        setMenuStatus(prev => {
            document.body.style.overflow = !prev ? 'hidden' : '';
            return !prev;
        });
    };
    const targetDate = new Date('2025-12-18');
    useEffect(() => {
        const currentDate = new Date();
        setIsSetup(currentDate > targetDate);
    }, []);
    const IdCheck = (async(userId: string, developerName:string) => {
        const { data, error } = await supabaseServer
            .from('store.apps')
            .select('*')
        if(error){
            console.error(error.message);
            return false;
        }
        for(const item of data){
            if(userId !== item.id && developerName === item.developer){
                return false;
            } else {
                continue;
            }
        }
        return true;
    });
    const Devfetched = (async(appId:string) => {
        try{
            if(appId.split(".")[2] && !appId.split(".")[3]){
                const res = await fetch("/api/store/details", {
                    method: "POST",
                    body: appId
                });
                const data = await res.json();
                return data;
            }
        }catch(e){
            console.error("error: ", e);
            return;
        }
    });
    const handleSubmit = (async(e: React.FormEvent) =>{
        e.preventDefault();
        const appName:string | undefined = (document.getElementById("application-name") as HTMLInputElement | null)?.value;
        const appId:string | undefined = (document.getElementById("application-id") as HTMLInputElement | null)?.value;
        const appDownloadURL:string | undefined = (document.getElementById("application-downloadurl") as HTMLInputElement | null)?.value;
        const appIconURL:string | undefined = (document.getElementById("application-iconurl") as HTMLInputElement | null)?.value;
        const appSiteURL:string | undefined = (document.getElementById("application-developerurl") as HTMLInputElement | null)?.value;
        const appVersion:string | undefined = (document.getElementById("application-version") as HTMLInputElement | null)?.value;
        const developerName:string | undefined = (document.getElementById("developer-name") as HTMLInputElement | null)?.value;
        const developerId:string | undefined = (document.getElementById("developer-id") as HTMLInputElement | null)?.value;
        const appDescription:string | undefined = (document.getElementById("application-description") as HTMLInputElement | null)?.value;
        const res = await Devfetched(appId!) as AppProps[];
        if(!res){
            console.error("Error: fetch出来ませんでした");
            return;
        }
        const isChecking:boolean = await IdCheck(user!.id, developerName!);
        if(!isChecking){
            console.error("他の開発者と名前が被っています!");
            return;
        }
        for(const item of res){
            if(item.appid !== appId && item.id === user?.id){
                const { error } = await supabaseServer
                .from("store.apps")
                .insert([{
                    appid: appId,
                    appicon_url: appIconURL,
                    download_url: appDownloadURL,
                    developer: developerName,
                    app_title: appName,
                    app_description: appDescription ?? null,
                    developer_siteurl: appSiteURL,
                    app_version: appVersion,
                    developer_id: developerId,
                    updated_at: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
                }]);
                if(error){
                    console.error("Error: ", error.message);
                }
                alert("公開成功!");
                //location.href = `/store/developer/${developerId}`;
                return;
            } else if(item.appid === appId){
                const { error } = await supabaseServer
                .from("store.apps")
                .update([{
                    appid: appId,
                    appicon_url: appIconURL,
                    download_url: appDownloadURL,
                    developer: developerName,
                    app_title: appName,
                    app_description: appDescription ?? null,
                    developer_siteurl: appSiteURL,
                    app_version: appVersion,
                    developer_id: developerId,
                    updated_at: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
                }])
                .eq("appid", appId)
                .eq("id", user?.id)
                if(error){
                    console.error("Error: ", error.message);
                }
                alert("公開成功!");
                location.href = `/store/developer/${developerId}`;
                return;
            } else {
                continue;
            }
        }
        alert("公開失敗");
        location.href = `/store/developer/${developerId}`;
        return;
    });
    return !isSetup && user ? (
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>13ninGamesStoreにアプリを公開</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/store/publish" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>13ninGamesStoreにアプリを公開</h1>
                        <form onSubmit={handleSubmit}>
                            <label>アプリケーション名
                                <input type="text" id="application-name" required/>
                            </label>
                            <br/><br/>
                            <label>アプリケーションid
                                <input type="text" id="application-id" pattern='^[^.]+\.[^.]+\.[^.]+$' required/>
                            </label>
                            <br/><br/>
                            <label>アプリケーションダウンロードURL
                                <input type="text" id="application-downloadurl" required/>
                            </label>
                            <br/><br/>
                            <label>アプリケーションアイコンURL
                                <input type="text" id="application-iconurl" required/>
                            </label>
                            <br/><br/>
                            <label>公式サイトURL
                                <input type="text" id="application-developerurl" required/>
                            </label>
                            <br/><br/>
                            <label>バージョン
                                <input type="text" id="application-version" required/>
                            </label>
                            <br/><br/>
                            <label>
                                デベロッパ名
                                <input type="text" id="developer-name" required/>
                            </label>
                            <br/><br/>
                            <label>
                                デベロッパid
                                <input type="text" id="developer-id" pattern='^[^.]+\.[^.]+$' required/>
                            </label>
                            <br/><br/>
                            <label>
                                アプリケーションの説明(任意)
                                <input type="text" id="application-description"/>
                            </label>
                            <br/><br/>
                            <button type="submit">
                                <span>公開する</span>
                            </button>
                        </form>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    ) : !isSetup ? (
        <>
            <p>ログインして下さい</p>
        </>
    ) : (
        <StoreUnopened/>
    );
}

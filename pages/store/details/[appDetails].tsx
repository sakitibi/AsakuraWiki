import Head from 'next/head';
import styles from 'css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { NextRouter, useRouter } from 'next/router';
import { supabaseServer } from '@/lib/supabaseClientServer';
import Custom404 from '@/pages/404';

export interface AppProps {
    id: string;
    app_title: string;
    developer: string;
    appicon_url: string;
    app_description: string | null;
    appid: string;
    download_url: string;
    developer_siteurl: string | null;
    official: boolean;
    app_version: string;
    isChecked: boolean;
    developer_id: string;
    download_counter: number;
    update_at: string;
}

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps | null>(null);
    const router:NextRouter = useRouter();
    const { appDetails } = router.query;
    // クエリ→文字列化
    const appDetailsStr:string = Array.isArray(appDetails) ? appDetails.join('/') : appDetails ?? '';
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

    useEffect(() => {
        const AppDataFetch = async () => {
            console.log("appDetails: ", appDetails);
            console.log("appDetailsStr: ", appDetailsStr);
            if(!appDetailsStr) return;
            const res = await fetch("/api/store/details", {
                method: 'POST',
                body: appDetailsStr
            });
            const data = await res.json();
            console.log("data: ", data);
            setApps(data); // concat不要
        };
        AppDataFetch();
    }, [appDetailsStr]);

    const InstallHandler = async(url:string, download_counter: number) => {
        if(!url) return;
        // データ取得
        const { error } = await supabaseServer
            .from('store.apps')
            .update({
                download_counter
            })
            .eq("appid", appDetailsStr)
        if(error){
            console.error("error: ", error.message);
            return;
        }
        window.location.href = url;
        return
    }

    return(
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>13ninGamesStore</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL={`/store/details/${appDetailsStr}`} rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            {!!apps ? (
                                <div id="details-container">
                                    {apps.isChecked ? (
                                        <div id="details-contents">
                                            <h1 id={styles.appTitle}>{apps.app_title}</h1>
                                            <p>
                                                <a id={styles.appDeveloper} href={`/store/developer/${apps.developer_id}`}>
                                                    {apps.developer}
                                                </a>
                                            </p>
                                            <div id={styles.appIconContainer}>
                                                <p>
                                                    <img
                                                        src={apps.appicon_url}
                                                        alt={`${apps.app_title}_icon`}
                                                        width="50"
                                                        height="50"
                                                    />
                                                </p>
                                            </div>
                                            <p>{apps.download_counter}ダウンロード</p>
                                            <div style={{ display: 'flex' }}>
                                                <button
                                                    id={styles.installButton}
                                                    className="installButton"
                                                    onClick={async() => await InstallHandler(apps.download_url, apps.download_counter + 1)}
                                                >
                                                    <span
                                                        style={{
                                                            textAlign: 'center',
                                                            margin: '0 auto'
                                                        }}
                                                    >
                                                        インストール
                                                    </span>
                                                </button>
                                            </div>
                                            <h3>このゲームについて</h3>
                                            <p style={{ maxWidth: '600px' }}>{apps.app_description ?? ""}</p>
                                            <p>最終更新日: {
                                                `${apps.update_at.split("-")[0]}/${apps.update_at.split("-")[1]}/${apps.update_at.split("-")[2].split(" ")[0]}`
                                            }</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <Custom404 isEmbed='true'/>
                            )}
                        </>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    )
}

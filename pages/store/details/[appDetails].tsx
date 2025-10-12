import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { NextRouter, useRouter } from 'next/router';

interface AppProps {
    app_title: string,
    developer: string,
    review: number,
    appicon_url: string,
    app_description: string | null,
    appid: string,
    download_url: string,
    developer_siteurl: string,
    official: boolean,
    app_version: string,
    isChecked: boolean,
    developer_id: string,
    download_counter: number,
    update_at: string
}

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps[]>([]);
    const [isSetup, setIsSetup] = useState(false);
    const router:NextRouter = useRouter();
    const { appDetails } = router.query;
    // クエリ→文字列化
    const appDetailsStr:string = Array.isArray(appDetails) ? appDetails.join('/') : appDetails ?? '';
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

    const AppTitleStyles:React.CSSProperties = {
        border: 0,
        fontSize: '44px',
        margin: 0,
        padding: 0,
        verticalAlign: 'baseline'
    }

    const DownloadButtonStyles:React.CSSProperties = {
        color: "rgb(32, 33, 36)",
        backgroundColor: "#00a173",
        minWidth: "160px",
        borderRadius: "8px",
        padding: "0 16px 0 16px",
        transition: "border .28s cubic-bezier(.4, 0, .2, 1), box-shadow .28s cubic-bezier(.4, 0, .2, 1)",
        boxShadow: "none"
    }

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
                    <LeftMenuJp URL="/store/details/" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            {!!apps ? apps.map((data, index) => (
                                <div id="details-container" key={index}>
                                    {data.isChecked ? (
                                        <div id="details-contents">
                                            <h1 style={AppTitleStyles}>{data.app_title}</h1>
                                            <p style={{ color: "#00a173" }}>
                                                <a style={{ color: 'inherit' }} href={`/store/developer/${data.developer_id}`}>
                                                    {data.developer}
                                                </a>
                                            </p>
                                            <div style={{ display: 'flex' }}>
                                                <p>
                                                    <img
                                                        src={data.appicon_url}
                                                        alt={`${data.app_title}_icon`}
                                                        width="50"
                                                        height="50"
                                                    />
                                                </p>
                                                <p>{data.review}</p>
                                                <p>{data.download_counter}ダウンロード</p>
                                            </div>
                                            <div style={{ display: 'flex' }}>
                                                <button
                                                    style={DownloadButtonStyles}
                                                >
                                                    インストール
                                                </button>
                                            </div>
                                            <h3>このゲームについて</h3>
                                            <p style={{ maxWidth: '600px' }}>{data.app_description ?? ""}</p>
                                            <p>最終更新日: {
                                                `${data.update_at.split("-")[0]}/${data.update_at.split("-")[1]}/${data.update_at.split("-")[2].split(" ")[0]}`
                                            }</p>
                                        </div>
                                    ) : null}
                                </div>
                            )) : null}
                        </>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    ) : (
        <>
            <Head>
                <title>準備中</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/store/details" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <p>準備中</p>
                    </main>
                    <RightMenuJp />
                </div>
                <FooterJp />
            </div>
        </>
    );
}

import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

interface AppProps {
    app_title: string;
    developer: string;
    appicon_url: string;
    app_description: string | null;
    appid: string;
}

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps[]>([]);
    const [osusume, setOsusume] = useState<AppProps[]>([]);

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
            const res = await fetch("/api/store/osusume_app");
            const data = await res.json();
            console.log("data: ", data);
            setApps(data); // concat不要
        };
        AppDataFetch();
    }, []);

    const osusumeCheck = () => {
        const count = Math.min(apps.length, 5);

        const shuffled = [...apps].sort(() => Math.random() - 0.5);
        const result = shuffled.slice(0, count);

        setOsusume(result);
    };

    useEffect(() => {
        if (apps.length === 0) return;
        osusumeCheck();
    }, [apps]);

    useEffect(() => {
        if (osusume.length > 0) {
            console.log("osusume updated: ", osusume);
        }
    }, [osusume]);

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
                    <LeftMenuJp URL="/store" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>13ninGamesStore</h1>
                        <div id="osusume-apps">
                            <p>おすすめアプリ</p>
                            <>
                                {osusume.length > 0 ? osusume.map((data, index) => (
                                    <>
                                        <div className='osusume' key={index} style={{ display: 'flex' }}>
                                            <img
                                                src={data.appicon_url}
                                                alt={`${data.app_title}_icon`}
                                                width="100"
                                                height="100"
                                            />
                                            <div style={{ display: 'block' }}>
                                                <a
                                                    href={`/store/details/${data.appid}`}
                                                    style={{ color: 'inherit' }}
                                                >
                                                    <h2>{data.app_title}</h2>
                                                    <p>{data.app_description}</p>
                                                    <p><small>{data.developer}</small></p>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )) : (
                                    <>
                                        <p>おすすめアプリ読み込み中</p>
                                    </>
                                )}
                            </>
                        </div>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    )
}

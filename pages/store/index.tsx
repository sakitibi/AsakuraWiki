import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { hasDuplicates } from '@/utils/array';
import StoreUnopened from '@/utils/pageParts/top/jp/storeunOpened';

interface AppProps {
    app_title: string;
    developer: string;
    review: number;
    appicon_url: string;
    app_description: string | null;
    appid: string;
}

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps[]>([]);
    const [isSetup, setIsSetup] = useState(false);
    const [osusume, setOsusume] = useState<AppProps[]>([]);
    const [osusumeData, setOsusumeData] = useState<AppProps[]>([]);

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

    const targetDate = new Date('2025-12-18 00:00:00');
    useEffect(() => {
        const currentDate = new Date();
        setIsSetup(currentDate < targetDate);
    }, []);

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
        const firstDatas = Array.from({ length: count }, () => {
            return apps[Math.floor(Math.random() * apps.length)];
        });

        console.log("firstDatas: ", firstDatas);

        if (apps.length > 1 && hasDuplicates(osusumeData)) {
            const nextDatas = Array.from({ length: osusumeData.length }, () => {
                return apps[Math.floor(Math.random() * apps.length)];
            });
            setOsusumeData(nextDatas);
            setTimeout(osusumeCheck, 500);
        } else {
            setOsusume(firstDatas);
        }
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
                    <LeftMenuJp URL="/store" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>13ninGamesStore</h1>
                        <div id="osusume-apps">
                            <p>おすすめアプリ</p>
                            <>
                                {osusume.map((data, index) => (
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
                                                    <p><small>{data.review}</small></p>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </>
                        </div>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    ) : (
        <StoreUnopened/>
    );
}

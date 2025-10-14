import Head from 'next/head';
import styles from 'css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { NextRouter, useRouter } from 'next/router';
import Custom404 from '@/pages/404';
import StoreUnopened from '@/utils/pageParts/top/jp/storeunOpened';
import type { AppProps } from '@/pages/store/details/[appDetails]';

export default function Store() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<AppProps[]>([]);
    const [isSetup, setIsSetup] = useState(false);
    const router:NextRouter = useRouter();
    const { developer } = router.query;
    // クエリ→文字列化
    const DevelopersStr:string = Array.isArray(developer) ? developer.join('/') : developer ?? '';
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
            console.log("developer: ", developer);
            console.log("DevelopersStr: ", DevelopersStr);
            if(!DevelopersStr) return;
            const res = await fetch("/api/store/details", {
                method: 'POST',
                body: DevelopersStr
            });
            const data = await res.json();
            console.log("data: ", data);
            setApps(data); // concat不要
        };
        AppDataFetch();
    }, [DevelopersStr]);

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
                    <LeftMenuJp URL="/store/developer/" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            <h1>{!!apps ? apps[0].developer : null}</h1>
                            {!!apps ? apps.map((data, index) => (
                                <div id="developers-container" key={index}>
                                    <div style={{ display: 'flex' }}>
                                        {data.isChecked ? (
                                            <a
                                                className={styles.developersApplink}
                                                href={`/store/details/${data.appid}`}
                                            >
                                                <img
                                                    src={data.appicon_url}
                                                    alt={`${data.app_title}_icon`}
                                                    width="50"
                                                    height="50"
                                                />
                                                <h2>{data.app_title}</h2>
                                                <p>{data.review}</p>
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            )) : (
                                <Custom404/>
                            )}
                        </>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    ) : (
        <StoreUnopened/>
    );
}

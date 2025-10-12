import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function About() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [apps, setApps] = useState<Object[]>([]);
    const [isSetup, setIsSetup] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const targetDate = new Date('2025-12-18');
    useEffect(() => {
        const currentDate = new Date();
        setIsSetup(currentDate > targetDate);
    }, [new Date().getDate()]);
    useEffect(() => {
        const AppDataFetch = async() => {
            const res = await fetch("/api/store/osusume_app", {
                method: "POST"
            });
            const data = await res.json();
            console.log("data: ", data);
            setApps(apps.concat(data));
        }
        AppDataFetch();
    }, []);
    useEffect(() => {
        if(!apps) return;
    }, [apps]);
    return (
        isSetup ? (
            <>
                <Head>
                    <meta charSet='UTF-8'/>
                    <title>13ninGamesStore</title>
                </Head>
                <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
                <div className={styles.contentsWrapper}>
                    <HeaderJp handleClick={handleClick}/>
                    <div className={styles.contents}>
                        <LeftMenuJp URL="/store" rupages='false'/>
                        <main style={{ padding: '2rem', flex: 1 }}>
                            <h1>13ninGamesStore</h1>
                            <div id="osusume-apps">
                                <p>おすすめアプリ</p>
                            </div>
                        </main>
                        <RightMenuJp/>
                    </div>
                    <FooterJp/>
                </div>
            </>
        ) : (
            <>
                <Head>
                    <title>準備中</title>
                </Head>
                <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
                <div className={styles.contentsWrapper}>
                    <HeaderJp handleClick={handleClick}/>
                    <div className={styles.contents}>
                        <LeftMenuJp URL="/store" rupages='false'/>
                        <main style={{ padding: '2rem', flex: 1 }}>
                            <p>準備中</p>
                        </main>
                        <RightMenuJp/>
                    </div>
                    <FooterJp/>
                </div>
            </>
        )
    );
}
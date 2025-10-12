import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

function hasDuplicates(array: any[]) {
    return new Set(array).size !== array.length;
}

export default function About() {
    const [menuStatus, setMenuStatus] = useState(false);
    const [apps, setApps] = useState<Object[]>([]);
    const [isSetup, setIsSetup] = useState(false);
    const [osusume, setOsusume] = useState<Object[]>([]);
    const [osusumeData, setOsusumeData] = useState<Object[]>([]);

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
                        </div>
                    </main>
                    <RightMenuJp />
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
                    <LeftMenuJp URL="/store" rupages='false' />
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

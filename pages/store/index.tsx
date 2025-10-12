import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

function hasDuplicates(array:any[]) {
    return new Set(array).size !== array.length;
}

export default function About() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [apps, setApps] = useState<Object[]>([]);
    const [isSetup, setIsSetup] = useState<boolean>(false);
    const [osusume, setOsusume] = useState<Object[]>();
    const [osusumeData, setOsusumeData] = useState<Object[]>([]);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const osusume_app_random_init = (): Object[] => {
        return [
            apps[Math.floor(Math.random() * apps.length)],
            apps[Math.floor(Math.random() * apps.length)],
            apps[Math.floor(Math.random() * apps.length)],
            apps[Math.floor(Math.random() * apps.length)],
            apps[Math.floor(Math.random() * apps.length)]
        ]
    }
    const targetDate = new Date('2025-12-18');
    useEffect(() => {
        const currentDate = new Date();
        setIsSetup(currentDate > targetDate);
    }, [new Date().getDate()]);
    useEffect(() => {
        const AppDataFetch = async() => {
            const res = await fetch("/api/store/osusume_app", {
                method: "GET"
            });
            const data = await res.json();
            console.log("data: ", data);
            setApps(apps.concat(data));
        }
        AppDataFetch();
    }, []);
    const osusumeCheck = () => {
        const firstDatas = osusumeData.map(data => {
            data = apps[Math.floor(Math.random() * apps.length)]
            return data;
        });
        console.log("firstDatas: ", firstDatas);
        if(hasDuplicates(osusumeData)){
            const nextDatas = osusumeData.map(data => {
                data = apps[Math.floor(Math.random() * apps.length)]
                return data;
            });
            setOsusumeData(nextDatas)
            setTimeout(() => {
                osusumeCheck();
            }, 500);
        } else {
            setOsusume(osusume?.concat(firstDatas));
            console.log("osusume: ", osusume?.concat(firstDatas));
        }
    }
    useEffect(() => {
        if(!apps) return;
        osusumeCheck();
    }, [apps]);
    return (
        !isSetup ? (
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
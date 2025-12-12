import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function NewsPage() {
    const [menuStatus, setMenuStatus] = useState(false);
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
    return (
        <>
            <Head>
                <title>2025/09/28 明後日のイベントの詳細</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/09/28/3'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 明後日のイベントの詳細</h1>
                        <ol>
                            <li><a href="/events/saegusarin-happybirthday">あさクラメンバーの三枝りんのお誕生日祭!(特設ページにて)</a></li>
                            <li><a href="/events/sumanai-agerukun-tuitou">すまない先生のあげるくんハウス爆破から4年、追悼式(特設ページにて)</a></li>
                        </ol>
                        <p>2つとも内容が長いので、特設ページにて詳細を言います</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
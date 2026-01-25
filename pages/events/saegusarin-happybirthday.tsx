import Head from 'next/head';
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function About() {
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
                <meta charSet='UTF-8'/>
                <title>あさクラメンバーの三枝りんの誕生日イベントについて</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/events/saegusarin-happybirthday"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>あさクラメンバーの三枝りんの誕生日イベントについて</h1>
                        <p>それを祝うイベントが2025年9月30日19時30分に開催されます!</p>
                        <p>開催場所 三枝りんハウス前</p>
                        <p>やること</p>
                        <ol>
                            <li>花火打ち上げ</li>
                            <li>臨時列車運行(あげるハウス~三枝)</li>
                        </ol>
                        <p>となっています</p>
                        <p><a href="https://youtube.com/live/OLzvOW0wbtM">ライブ配信はこちら</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
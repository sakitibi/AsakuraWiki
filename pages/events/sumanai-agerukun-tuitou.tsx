import Head from 'next/head';
import styles from 'css/index.min.module.css';
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
                <title>あさクラメンバーのあげるくんの家が爆破されてから2025年9月30日午後4時で4年</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/events/sumanai-agerukun-tuitou"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>あさクラメンバーのあげるくんの家が爆破されてから<br/>2025年9月30日午後4時で4年</h1>
                        <p>なので追悼式をします</p>
                        <p>開催場所 あげるハウス敷地内</p>
                        <p>やること</p>
                        <ol>
                            <li><ruby>蝋燭<rt>ろうそく</rt></ruby>を灯す</li>
                            <li>臨時列車運行(あげるハウス~三枝)</li>
                        </ol>
                        <p>となっています</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
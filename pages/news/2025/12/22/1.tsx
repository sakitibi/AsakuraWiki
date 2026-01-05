import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { company } from '@/utils/version';


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
                <title>2025/12/22 24日〜25日について</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2025/12/22/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/12/22 24日〜25日について</h1>
                        <p>12月24日〜25日は</p>
                        <p>あさクラ全体の鉄道線が大幅に遅れました</p>
                        <p>なぜなら名前は長い方が有利への対応に協力する為です</p>
                        <p style={{ color: "red" }}>{company}の社員たちも休日出勤となりました</p>
                        <p>利用者に出来ること</p>
                        <ol>
                            <li>SNSなどで名前は長い方が有利を批判する</li>
                            <li>名前は長い方が有利を運営に通報する</li>
                        </ol>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
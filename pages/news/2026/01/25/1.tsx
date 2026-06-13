import Head from 'next/head';
import styles from '@/css/index.module.css';
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
                <title>2026/01/25 また同じ時期に大量のメンバー申請が来た為、</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/01/25/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/01/25 また同じ時期に大量のメンバー申請が来た為、</h1>
                        <p>また同じ時期に大量のメンバー申請が来た為、</p>
                        <p>審査の基準が一時的に厳しくなっています。</p>
                        <p>なぜならサーバーの処理が追いつか無いからです</p>
                        <p>また、あさクラという名称になってから1月26日で3年です。</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
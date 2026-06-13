import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useState, useEffect } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';


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
                <title>2025/11/13 Наблюдение за сильным снегопадом в районе снежного поля на западе Асакуры</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2025/11/13/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>
                            <i
                                className="fa-solid fa-snowflake"
                                style={{ fontSize: "inherit", color: "#c6f6ff" }}
                            ></i>
                            2025/11/13 Наблюдение за сильным снегопадом<br/> в районе снежного поля на западе Асакуры
                        </h1>
                        <p>Потому что сильный снегопад наблюдался<br/> в районе снежного поля на западе Асакуры</p>
                        <p>Многие железнодорожные линии сталкиваются<br/> с задержками и приостановками.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
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
                <title>2025/12/14 18-е — 13ninGamesStore в полном разгаре!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2025/12/14/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/12/14 18-е — 13ninGamesStore в полном разгаре!</h1>
                        <p>Причина в том, что Закон о смартфонах<br/> вступит в силу с 18 декабря 2025 года</p>
                        <p>Он был там уже давно, но практически<br/> невозможно было его опубликовать</p>
                        <p>18 декабря 2025 года — Любой, у кого есть аккаунт 13nin</p>
                        <p>Любой может его опубликовать</p>
                        <p><a href='/store'>Нажмите здесь для получения подробностей</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
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
                <title>2025/12/14 18-е — 13ninGamesStore в полном разгаре!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2025/12/14/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/12/14 18-е — 13ninGamesStore в полном разгаре!</h1>
                        <p>Причина в том, что Закон о смартфонах<br/> вступит в силу с 18 декабря 2025 года</p>
                        <p>Он был там уже давно, но практически<br/> невозможно было его опубликовать</p>
                        <p>18 декабря 2025 года — Любой, у кого есть аккаунт 13nin</p>
                        <p>Любой может его опубликовать</p>
                        <p><a href='/store'>Нажмите здесь для получения подробностей</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
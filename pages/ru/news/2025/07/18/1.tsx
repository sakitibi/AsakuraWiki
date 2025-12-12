import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useEffect, useState } from 'react';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
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
                <title>2025/07/18 Конференция Асакура отложена из-за системных неполадок...</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2025/07/18/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/18 Конференция Асакура<br/>отложена из-за системных неполадок...</h1>
                        <p>Причиной этого<br/>стали неверные настройки таблицы комментариев супербазы.</p>
                        <p>Встреча в Асакуре была отложена, и нам пришлось<br/>немедленно провести системное обслуживание Wiki-сайта Асакура.</p>
                        <p>Теперь это исправлено.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
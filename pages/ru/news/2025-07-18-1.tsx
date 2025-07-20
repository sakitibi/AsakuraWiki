import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import HeaderRu from '@/utils/pageParts/HeaderRu';
import MenuRu from '@/utils/pageParts/MenuRu';
import LeftMenuRu from '@/utils/pageParts/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/RightMenuRu';
import FooterRu from '@/utils/pageParts/FooterRu';

export default function NewsPage() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
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
                    <LeftMenuRu URL="/news/2025-07-18-1"/>
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
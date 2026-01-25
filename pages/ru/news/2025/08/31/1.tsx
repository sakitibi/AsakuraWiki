import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useState, useEffect } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';

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
                <title>2025/08/31 元神 魔王 слишком много нарушений, поэтому он добавляется в уровень злонамеренных пользователей на уровне отчетности одним выстрелом</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/08/31/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/31 元神 魔王 слишком много нарушений, поэтому он добавляется в уровень <br/>злонамеренных пользователей на уровне отчетности одним выстрелом</h1>
                        <p>Имя пользователя на YouTube: 元神 魔王 сделал<br/>такое злобное заявление</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/問題発言2025-08-31 16.45.32.png" alt='Изображение проблемных замечаний оригинального 元神 魔王' width="500" height="350"/></p>
                        <p>Я могу выполнить только задачу 1, и этот способ сказать очень порочный!<br/>Мне жаль новичков, которые могут выполнить только задание 1!</p>
                        <p>А источником этих злонамеренных замечаний является NMNGyuri.</p>
                        <p>元神 魔王 также рекомендовал колонку сводки!</p>
                        <p>Это четкие<a href="/policies">利用規約</a>и нарушение законодательства!</p>
                        <p>Вполне вероятно, что против 元神 魔王 <br/>предприняты юридические действия.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
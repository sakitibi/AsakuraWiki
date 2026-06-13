import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import { useState, useEffect } from 'react';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
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
                <title>2025/09/28 Завтра участница Асакуры Чиби-тян сменит имя.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/28/2'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 Завтра участница Асакуры Чиби-тян сменит имя.</h1>
                        <p>Имя будет изменено с «Чиби-тян» <br/>на «Цубаки Цубаки-тян».</p>
                        <p>Причина в том, что Чиби-тян<br/> «Цубаки Цубаки-тян» — 3 года.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
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
                <title>2026/04/25 Число жертв НМНГюри превысило 410 человек.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2026/04/25/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/04/25 Число жертв НМНГюри превысило 410 человек.</h1>
                        <p>Пожалуйста, не заходите в комнату NMNGyuri.</p>
                        <p>Пожалуйста, не смотрите описание NMNGyuri.</p>
                        <p>Это важное предупреждение.</p>
                        <p><a href="/wiki/13ninstudio/名前は長い方が有利被害者">Нажмите здесь для получения подробной информации.</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}

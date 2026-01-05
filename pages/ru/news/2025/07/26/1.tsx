import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import { useState, useEffect } from 'react';
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
                <title>2025/07/26 Отличные новости! Minecraft General Transportation (mgtn) забанен!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/07/26/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/26 Отличные новости! Minecraft General Transportation (mgtn)<br/>забанен!</h1>
                        <p>Я думаю, что причиной, скорее всего, является вандализм.</p>
                        <p>Администраторы<small>(и участники)</small>этого сервиса в полном восторге!</p>
                        <p>Это бог управления!!! Здорово!!!</p>
                        <p>Моё желание сбылось ооооо!!!</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/WIKIWIKI利用規約違反で削除されました.png" alt='Изображение удалено из-за нарушения Условий использования WIKIWIKI' width="500" height="350"/></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
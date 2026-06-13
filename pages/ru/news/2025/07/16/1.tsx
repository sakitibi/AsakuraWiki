import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useState, useEffect } from 'react';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
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
                <title>2025/07/16 Сильный ветер нанес ущерб юго-востоку Асакуры , будьте осторожны.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025-07/16/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>
                            <i
                                className="fa-solid fa-tornado"
                                style={{ fontSize: "inherit", color: "#909090" }}
                            ></i>
                            2025/07/16 Сильный ветер нанес ущерб юго-востоку<br/>Асакуры , будьте осторожны.
                        </h1>
                        <p>Около 16:00 15 июля 2025 года в районе Train<br/>Builder World поднялся сильный ветер .</p>
                        <p>Предполагается, что тайфун обрушился на материк около 14:57 16 июля 2025 года.</p>
                        <p>Это привело к задержкам и приостановке обслуживания в некоторых районах.</p>
                        <p>Пройдя Train Builder.. Waon GAMES.. Odomin Craft..Asakura <br/> .. я наконец добрался до правого верхнего угла.</p>
                        <p>Путь следующий:</p>
                        <div id="img">
                            <img alt="Путь следующий" src="https://sakitibi.github.io/AsakuraWiki-Images/2025-07-16%2015.34.00.png" width="500" height="350"/>
                        </div>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
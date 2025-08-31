import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import HeaderRu from '@/utils/pageParts/top/HeaderRu';
import FooterRu from '@/utils/pageParts/top/FooterRu';

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
                <title>2025/07/16 Сильный ветер нанес ущерб юго-востоку Асакуры , будьте осторожны.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025-07/16/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/16 Сильный ветер нанес ущерб юго-востоку<br/>Асакуры , будьте осторожны.</h1>
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
import Head from 'next/head';
import styles from 'css/index.min.module.css';
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
                <title>2025/07/22 Строится замок на юго-западной стороне второго города Нового города..</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/07/22/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/22 Строится замок на юго-западной стороне <br/>второго города Нового города</h1>
                        <p>В настоящее время строится замок на юго-западной стороне второго города, Нового города</p>
                        <p>Что будет внутри – неизвестно</p>
                        <p>Действующие здания<br/><img src="https://sakitibi.github.io/AsakuraWiki-Images/CastleTochu.png" alt="城建設中画像"/></p>
                        <p>Тем не менее, SKNewRoles заявляет, что ее штаб-квартира будет находиться в этом здании</p>
                        <p>Кажется, он довольно популярен, поэтому его как будто делают большим</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
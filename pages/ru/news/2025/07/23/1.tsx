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
                <title>2025/07/23 Внешний вид замка на юго-западной стороне второго города Новый город завершен!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/07/23/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/23 Внешний вид замка на юго-западной <br/>стороне второго города Новый город завершен!</h1>
                        <p>Что будет внутри – неизвестно</p>
                        <p>Нынешнее здание<br/><img src="https://sakitibi.github.io/AsakuraWiki-Images/CastleFull.png" alt="城画像" width="500" height="350"/></p>
                        <p>Тем не менее, SKNewRoles заявляет, что ее штаб-квартира <br/>будет находиться в этом здании</p>
                        <p>Кажется, что он стал популярным, потому что <br/>кажется довольно популярным</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
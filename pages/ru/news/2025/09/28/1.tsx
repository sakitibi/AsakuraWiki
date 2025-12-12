import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import { useState, useEffect } from 'react';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import { company } from '@/utils/version';

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
                <title>2025/09/28 Император и Императрица приезжают в дом моего лучшего друга.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/28/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 Сегодня и завтра Император и Императрица<br/> приедут в дом моего лучшего друга (<a href="https://youtube.com/@kyunosuke_odomin">Кюносукэ</a>).</h1>
                        <p>Кюносукэ говорит, что выгонит их.</p>
                        <p>{company} ответил на это следующим образом:</p>
                        <p>Мы запретим въезд Их Величествам<br/> Императору и Императрице.</p>
                        <p>Мы ценим ваше понимание и сотрудничество.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
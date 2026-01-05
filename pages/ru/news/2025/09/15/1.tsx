import Head from 'next/head';
import styles from '@/css/index.min.module.css';
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
                <title>2025/09/15 Наконец, завтра Асакура Part 500!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/15/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/15 Наконец, завтра Асакура Part 500!</h1>
                        <p>В честь Asakura Part 500 мы проведем следующее живое выступление!</p>
                        <ol>
                            <li><s>13:00~15:30 Онлайн-чат был отменен.</s></li>
                            <li><s>13:00~15:30 Тур по миру Асакура завершился.</s></li>
                            <li><s>Программирование в прямом эфире с 22:00 ~ 23:30!</s>Законченный</li>
                        </ol>
                        <p><a href='https://youtube.com/playlist?list=PLDsY7IAMYhhhfOs5lUUSTs2YRy0crDNAj'>Подробнее о плейлистах</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
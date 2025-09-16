import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import HeaderRu from '@/utils/pageParts/top/HeaderRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import FooterRu from '@/utils/pageParts/top/FooterRu';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';

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
                            <li>13:00~15:30 URL блокировки онлайн-чата (пока нет)</li>
                            <li>13:00~15:30 Тур по миру Асакура</li>
                            <li>Программирование в прямом эфире с 22:00 ~ 23:30!</li>
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
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import MenuRu from '@/utils/pageParts/MenuRu';
import LeftMenuRu from '@/utils/pageParts/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/RightMenuRu';
import HeaderRu from '@/utils/pageParts/HeaderRu';
import FooterRu from '@/utils/pageParts/FooterRu';

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
                <title>『Официальные』новости Асакуры!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『Официальные』новости Асакуры!</h1>
                        <ul>
                            <li>2025/07/22 <a href="/ru/news/2025-07-22-1">Строится замок на юго-западной стороне второго города Нового города..</a></li>
                            <li>2025/07/18 <a href="/ru/news/2025-07-18-1">Собрание Асакура отложено из-за системных неполадок...</a></li>
                            <li>2025/07/16 <a href="/ru/news/2025-07-16-1">Сильный ветер нанес ущерб юго-востоку Асакуры, будьте осторожны</a></li>
                        </ul>
                        <small>
                            Обратите внимание, что сказанное здесь исходит из уст Асакуры и<br/>может не иметь отношения к реальным новостям.
                        </small>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
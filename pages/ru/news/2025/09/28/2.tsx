import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import { useState } from 'react';
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
                <title>2025/09/28 Завтра участница Асакуры Чиби-тян сменит имя.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/28/2'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 Завтра участница Асакуры Чиби-тян сменит имя.</h1>
                        <p>Имя будет изменено с «Чиби-тян» <br/>на «Цубаки Цубаки-тян».</p>
                        <p>Причина в том, что Чиби-тян<br/> «Цубаки Цубаки-тян» — 3 года.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
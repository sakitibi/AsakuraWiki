import Head from 'next/head';
import styles from 'css/index.min.module.css';
import { useState } from 'react';
import HeaderRu from '@/utils/pageParts/HeaderRu';
import MenuRu from '@/utils/pageParts/MenuRu';
import LeftMenuRu from '@/utils/pageParts/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/RightMenuRu';
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
                <title>2025/08/17 Хорошие новости! Кто-то вчера атаковал мою железную сеть!</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2025-07-18-1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/17 Хорошие новости! Кто-то<br/>вчера атаковал мою железную сеть!</h1>
                        <p>Комитет по искоренению «Моей железной сети», кажется, рад этому</p>
                        <p>Давайте поддерживать и сотрудничать со злоумышленникамив сети Maitetsu Network</p>
                        <p>Благодарим Вас за сотрудничество</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
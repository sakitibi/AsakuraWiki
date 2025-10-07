import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import { useState } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function About() {
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
                <meta charSet='UTF-8'/>
                <title>Исполняется четыре года с тех пор, как 30 сентября 2025 года в 16:00 был взорван дом члена клана Асакура, Агеру-куна.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/events/sumanai-agerukun-tuitou"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Исполняется четыре года с тех пор, как 30 сентября 2025<br/> года в 16:00 был взорван дом члена клана Асакура, Агеру-куна.</h1>
                        <p>Так что мы проведем панихиду</p>
                        <p>Место проведения: На территории дома</p>
                        <p>Чем заняться</p>
                        <ol>
                            <li>свечаОзарять</li>
                            <li>Специальные поезда (AgeruHouse ~ Saegusa)</li>
                        </ol>
                        <p>Стало</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}
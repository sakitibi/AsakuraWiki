import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/HeaderRu';
import MenuRu from '@/utils/pageParts/top/MenuRu';
import { useState } from 'react';
import LeftMenuRu from '@/utils/pageParts/top/LeftMenuRu';
import RightMenuRu from '@/utils/pageParts/top/RightMenuRu';
import FooterRu from '@/utils/pageParts/top/FooterRu';

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
                <title>Прошло 4 года с тех пор, как член Асакуры Агеру-кун был взорван</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/events/sumanai-agerukun-tuitou"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Прошло 4 года с тех пор, как член<br/> Асакуры Агеру-кун был взорван</h1>
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
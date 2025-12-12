import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import { useState, useEffect } from 'react';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
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
                <title>2025/09/28 Подробности завтрашнего мероприятия</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL='/news/2025/09/28/3'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 Подробности завтрашнего мероприятия</h1>
                        <ol>
                            <li><a href="/ru/events/saegusarin-happybirthday">Празднование дня рождения участника<br/> Asakura Рин Саэгусы! (Специальная страница)</a></li>
                            <li><a href="/ru/events/sumanai-agerukun-tuitou">Четыре года со дня взрыва дома Сэнсэя Агеру-куна,<br/> поминальная служба (на специальной странице)</a></li>
                        </ol>
                        <p>Оба они длинные, поэтому я объясню<br/> подробности на специальной странице.</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
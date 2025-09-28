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
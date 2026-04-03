import Head from 'next/head';
import styles from '@/css/index.module.css';
import { useState, useEffect } from 'react';
import { company } from '@/utils/version';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import MenuRu from '@/utils/pageParts/top/ru/Menu';


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
                <title>2025/12/22 Примерно 24-го и 25-го числа.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2025/12/22/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/12/22 Примерно 24-го и 25-го числа.</h1>
                        <p>24-25 декабря</p>
                        <p>На всех линиях метро Асакуры ожидаются значительные задержки.</p>
                        <p>Потому что мы сотрудничаем в реагировании на действия NMNGyuri.</p>
                        <p style={{ color: "red" }}>Сотрудники {company} также будут работать в праздничные дни.</p>
                        <p>Что могут делать пользователи</p>
                        <ol>
                            <li>Критика NMNGyuri в социальных сетях и т.д.</li>
                            <li>Сообщите администраторам о NMNGyuri.</li>
                        </ol>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
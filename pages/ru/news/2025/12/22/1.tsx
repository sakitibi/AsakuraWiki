import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { company } from '@/utils/version';


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
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2025/12/22/1"/>
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
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
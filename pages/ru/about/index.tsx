import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import { useEffect, useState } from 'react';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';

export default function About() {
    const [menuStatus, setMenuStatus] = useState(false);
    useEffect(() => {
        if (typeof document !== 'undefined') {
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
                <meta charSet='UTF-8'/>
                <title>Об этом вики-сайте по аренде</title>
            </Head>
            <nav className={styles.pSpNav} id="p-sp-nav" style={{display: menuStatus ? 'block' : 'none', zIndex: menuStatus ? 9999 : -9999}}>
                <div className={styles.pSpNav__title}>
                    меню
                    <div className={styles.pSpNav__btnClose} onClick={handleClick}>×</div>
                </div>
                <div className={styles.pSpNav__register}>
                    <a className={`${styles.btn} ${styles.btnPrimary} ${styles.col12}`} href="https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69">Войти/Зарегистрироваться (японский)</a>
                </div>
            </nav>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/about"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Об этом вики-сайте по аренде</h1>
                        <p>Эта Wiki (далее именуемая Asakura Wiki)</p>
                        <p>Открытый исходный код, например<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a></p>
                        <p>Наша цель — предоставить простую в использовании услугу аренды Wiki.</p>
                        <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>Источник здесь</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    );
}
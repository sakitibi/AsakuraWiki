import Head from 'next/head';
import styles from '@/css/index.module.css';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import { useEffect, useState } from 'react';


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
                <title>2026/01/31 Срочные новости: Среднесуточное число жертв в НМНГюри достигло рекордного уровня.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2026/01/31/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/01/31 Срочные новости: Среднесуточное число жертв в НМНГюри достигло рекордного уровня.</h1>
                        <p>В связи с этим мы временно приостанавливаем отбор участников группы «Асакура».</p>
                        <p>Никогда не смотрите раздел описания NMNGyuri.</p>
                        <p>Просмотр раздела описания NMNGyuri запрещен в соответствии с <a href="/policies">Условиями использования</a>.</p>
                        <p>Мы также ужесточили наши <a href="/policies">Условия использования</a>.</p>
                        <p>С этого момента, если вы хотя бы раз заходили на Asakura Wiki, вам потребуется согласиться с условиями использования.</p>
                        <p><a href="https://youtu.be/rsxcYICOQ0A">Распространение выпусков</a></p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
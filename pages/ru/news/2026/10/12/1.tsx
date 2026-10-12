import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuRu from '@/utils/pageParts/top/ru/LeftMenu';
import MenuRu from '@/utils/pageParts/top/ru/Menu';
import RightMenuRu from '@/utils/pageParts/top/ru/RightMenu';
import { useState, useEffect } from 'react';
import HeaderRu from '@/utils/pageParts/top/ru/Header';
import FooterRu from '@/utils/pageParts/top/ru/Footer';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=604800, stale-while-revalidate=59'
    );

    return {
        props: {},
    };
}

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
                <title>2026/10/12 Вчера мы провели выборы в исполнительный орган. Сегодня мы провели общее собрание сотрудников.</title>
            </Head>
            <MenuRu handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderRu handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuRu URL="/news/2026/10/12/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/10/12 Вчера мы провели выборы в исполнительный орган. Сегодня мы провели общее собрание сотрудников.</h1>
                        <p>Во время исполнительных выборов каждый кандидат искренне делился своими предвыборными<br/> обещаниями с учениками средней школы, пришедшей за опытом работы на работе.</p>
                        <p>На общем собрании сотрудников избранные члены поочерёдно вносили предложения.</p>
                        <p>Естественно, некоторые из них были одобрены, другие — отклонены.</p>
                        <p>Автор: Кахо Мацуяма</p>
                    </main>
                    <RightMenuRu/>
                </div>
                <FooterRu/>
            </div>
        </>
    )
}
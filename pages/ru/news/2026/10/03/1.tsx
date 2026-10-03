import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
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
                <title>2026/10/03 Завтра я проведу церемонию предложения о работе.</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/10/03/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/10/03 Завтра я проведу церемонию предложения о работе.</h1>
                        <p>Уже довольно поздно, но завтра у меня будет церемония предложения.</p>
                        <p>Он начинается в 9 утра.</p>
                        <p>Проводятся такие мероприятия, как вручение сертификатов о работе от сотрудников HR и хоры из различных отделов и отделов.</p>
                        <p><a href="https://sakitibi.github.io/static.asakurawiki.com/docs/令和8年度議案書.pdf">Мы также опубликовали предложение этого года.</a></p>
                        <p>Автор: Сиори Судзука</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
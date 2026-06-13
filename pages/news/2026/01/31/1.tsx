import Head from 'next/head';
import styles from '@/css/index.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';


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
                <title>2026/01/31 緊急速報 名前は長い方が有利の被害者が1日平均過去最大です</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/01/31/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/01/31 緊急速報 名前は長い方が有利の被害者が1日平均過去最大です</h1>
                        <p>これに伴い、あさクラメンバーの審査を一時停止させていただきます。</p>
                        <p>名前は長い方が有利の配信の概要欄を決して見ないでください。</p>
                        <p>名前は長い方が有利の配信の概要欄の閲覧は、<a href="/policies">利用規約</a>で禁止されています。</p>
                        <p><a href="/policies">利用規約</a>も厳しくしました。</p>
                        <p>今後、あさクラWikiを一度でもご利用いただいた場合は、利用規約に同意いただく必要があります。</p>
                        <p><a href="https://youtu.be/rsxcYICOQ0A">問題の配信</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
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
                <title>2026/03/08 名前は長い方が有利対策のAI開発</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2026/03/08/1"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2026/03/08 名前は長い方が有利対策のAI開発</h1>
                        <p>先日、ゲーム開発事業から撤退と申し上げたのですが</p>
                        <p>業務効率化の為、名前は長い方が有利対策のAIを開発しています</p>
                        <p>ちなみにソース公開しています</p>
                        <p><a href="https://github.com/sakitibi/NMNGyuri-hihan-api/tree/main/backend">詳しくはこちら</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}

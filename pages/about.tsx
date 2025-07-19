import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';

export default function Home() {
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
                <meta charSet='UTF-8'/>
                <title>当レンタルWikiについて</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/about"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>当レンタルWikiについて</h1>
                        <p>当Wiki(以下あさクラWiki)は</p>
                        <p>オープンソースで<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a>などより</p>
                        <p>使いやすいレンタルWikiサービスを目指しています。</p>
                        <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>ソースはここ</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <footer className={styles.footer}>
                    <div style={{textAlign: "center"}}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>当Wikiサービスはオープンソースプロジェクトです</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
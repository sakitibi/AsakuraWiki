import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';

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
                    <LeftMenuJp/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>当レンタルWikiについて</h1>
                        <p>当Wiki(以下あさクラWiki)は</p>
                        <p>オープンソースで<a href='https://wikiwiki.jp' target='_blank'>WIKIWIKI</a>などより</p>
                        <p>使いやすいレンタルWikiサービスを目指しています。</p>
                        <p><a href='https://github.com/sakitibi/AsakuraWiki' target='_blank'>ソースはここ</a></p>
                    </main>
                    <aside className={`${styles.lContents__aside} ${styles.childrenSpaced}`}>
                        <div className={styles.pForBeginner}>
                            <h2 className={styles.pForBeginner__title}>初めての方へ</h2>
                            <ul className={styles.pForBeginner__list}>
                                <li className={styles.pForBeginner__item}>
                                    <a href="/wiki/sample">サンプルWiki</a>
                                </li>
                            </ul>
                        </div>
                    </aside>
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
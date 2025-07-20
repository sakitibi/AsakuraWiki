import Head from 'next/head';
import { useState } from 'react';
import styles from 'css/index.min.module.css';
import MenuJp from '@/utils/pageParts/MenuJp';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import HeaderJp from '@/utils/pageParts/HeaderJp';

export default function NewsPage() {
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
                <title>『公式』あさクラニュース!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『公式』あさクラニュース!</h1>
                        <ul>
                            <li>2025/07/18 <a href="/news/2025-07-18-1">あさクラ会議がシステムトラブルで延期に..</a></li>
                            <li>2025/07/16 <a href="/news/2025-07-16-1">あさクラ南東部で強風被害が出ています、ご注意下さい</a></li>
                        </ul>
                        <small>
                            注意 ここに出て来るものはあさクラ内の話です、<br/>実際のニュースとは関係無いものもあります、
                        </small>
                    </main>
                    <RightMenuJp/>
                </div>
                <footer className={styles.footer}>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p>Copyright 2025 13ninstudio All rights Reserved</p>
                        <p>当Wikiサービスはオープンソースプロジェクトです</p>
                    </div>
                </footer>
            </div>
        </>
    )
}
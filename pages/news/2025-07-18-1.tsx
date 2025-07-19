import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import { useState } from 'react';

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
                <title>2025/07/18 あさクラ会議がシステムトラブルで延期に..</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-07-18-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/18 あさクラ会議がシステム<br/>システムトラブルで延期に..</h1>
                        <p>その原因は「supabaseのcommentsテーブル<br/>の設定がおかしかったからです」</p>
                        <p>あさクラ会議は延期となり、<br/>すぐにあさクラWikiのシステム<br/>メンテナンスをすることになった</p>
                        <p>現在は修正されています</p>
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
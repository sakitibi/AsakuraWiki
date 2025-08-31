import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import { useState } from 'react';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';

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
                <title>2025/08/28 マイクラバーサス ハッピーガスト スカイバトル! が開催されます!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-08-28-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/28 マイクラバーサス ハッピーガスト<br/>スカイバトル! が開催されます!</h1>
                        <p><a href="/minecraft/vs/happy-ghast-sky-battle">詳細はこちら</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
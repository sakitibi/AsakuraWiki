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
                <title>2025/08/31 元神 魔王を違反点多すぎるので一発で 通報レベルで悪質なユーザーに追加</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-07-18-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/31 元神 魔王を違反点多すぎるので一発で<br/>通報レベルで悪質なユーザーに追加</h1>
                        <p>YouTubeのユーザー名: 元神 魔王 が<br/>このような悪質な発言をしていました</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/問題発言2025-08-31 16.45.32.png" alt='元神 魔王の問題発言の画像' width="500" height="350"/></p>
                        <p>元神 魔王に対しては法的措置を取る場合が高いです、</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
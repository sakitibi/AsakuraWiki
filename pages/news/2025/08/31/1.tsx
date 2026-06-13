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
                <title>2025/08/31 元神 魔王を違反点多すぎるので一発で 通報レベルで悪質なユーザーに追加</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/08/31/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/31 元神 魔王を違反点多すぎるので一発で<br/>通報レベルで悪質なユーザーに追加</h1>
                        <p>YouTubeのユーザー名: 元神 魔王 が<br/>このような悪質な発言をしていました</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/問題発言2025-08-31 16.45.32.png" alt='元神 魔王の問題発言の画像' width="500" height="350"/></p>
                        <p>タスク1しかできないだけでこの言いかたは非常に悪質です!<br/>タスク1しかできない初心者さんが可哀想です!</p>
                        <p>そしてこのような悪質な発言の元となったのは名前は長い方が有利の発言</p>
                        <p>元神 魔王は概要欄も勧めてきました!</p>
                        <p>これは明確な<a href="/policies">利用規約</a>と法律違反です!</p>
                        <p>元神 魔王に対しては法的措置を取る場合が高いです、</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
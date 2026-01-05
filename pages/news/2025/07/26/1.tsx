import Head from 'next/head';
import styles from 'css/index.min.module.css';
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
                <title>2025/07/26 超朗報! Minecraft総合交通(mgtn)がBANされたあああぁ!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/07/26/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/26 超朗報! Minecraft総合交通(mgtn)<br/>がBANされたあああぁ!</h1>
                        <p>多分理由は荒らし行為だと思います</p>
                        <p>このサービスの管理者<small>(とメンバー)</small>めっちゃ大喜び!!!!</p>
                        <p>これは運営神!!!ナイス!!!!</p>
                        <p>願いが叶ったぞおおおおおぉ!!!</p>
                        <p>追記: https://wikiwiki.jp/vgtn になってました、まだ残ってたみたいです</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/WIKIWIKI利用規約違反で削除されました.png" alt='WIKIWIKI利用規約違反で削除されましたの画像' width="500" height="350"/></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
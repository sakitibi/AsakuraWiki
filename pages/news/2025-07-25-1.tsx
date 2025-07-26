import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import { useState } from 'react';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import FooterJp from '@/utils/pageParts/FooterJp';

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
                <title>2025/07/25 超朗報! Minecraft総合交通(mgtn)がBANされたあああぁ!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-07-23-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/25 超朗報! Minecraft総合交通(mgtn)<br/>がBANされたあああぁ!</h1>
                        <p>多分理由は荒らし行為だと思います</p>
                        <p>このサービスの管理者<small>(とメンバー)</small>めっちゃ大喜び!!!!</p>
                        <p>これは運営神!!!ナイス!!!!</p>
                        <p>願いが叶ったぞおおおおおぉ!!!</p>
                        <p><img src="https://sakitibi.github.io/AsakuraWiki-Images/WIKIWIKI利用規約違反で削除されました.png" alt='WIKIWIKI利用規約違反で削除されましたの画像' width="500" height="350"/></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
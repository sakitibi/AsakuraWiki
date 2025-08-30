import Head from 'next/head';
import styles from 'css/index.min.module.css';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
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
                <title>2025/07/16 あさクラ南東部で強風被害が出ています、ご注意下さい</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-07-16-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/16 あさクラ南東部で<br/>強風被害が出ています、ご注意下さい</h1>
                        <p>2025/07/15 16:00ごろ Train Builderワールド近海で<br/>強風が発生いたしました</p>
                        <p>2025/07/16 14:57ごろにあさクラ本土に上陸したと見ています</p>
                        <p>この影響で一部の地域で遅れや運転見合わせなどが発生しています</p>
                        <p>Train Builder .. 和音GAMES .. おどみんクラフト .. あさクラ<br/> .. と通った後に最終的には右上に抜けて行きました</p>
                        <p>進路は以下の通り</p>
                        <div id="img">
                            <img alt="進路" src="https://sakitibi.github.io/AsakuraWiki-Images/2025-07-16%2015.34.00.png" width="500" height="350"/>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
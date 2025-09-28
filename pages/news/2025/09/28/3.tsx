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
                <title>2025/09/28 明後日のイベントの詳細</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/09/28/3'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 明後日のイベントの詳細</h1>
                        <ol>
                            <li>あさクラメンバーの三枝りんのお誕生日祭!(特設ページにて)</li>
                            <li>すまない先生のあげるくんハウス爆破から4年、追悼式(特設ページにて)</li>
                        </ol>
                        <p>2つとも内容が長いので、特設ページにて詳細を言います</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
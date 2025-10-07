import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

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
                <title>2025/08/17 朗報!、おととい〜昨日ごろ、マイ鉄ネットワークに誰かが攻撃してくれました!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/08/17/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/08/17 朗報!、おととい〜昨日ごろ、マイ鉄ネットワークに<br/>誰かが攻撃してくれました!</h1>
                        <p>これにはマイ鉄ネット撲滅委員会も嬉しい様子</p>
                        <p>みなさまでマイ鉄ネットワークへの攻撃者を<br/>応援、協力しましょう</p>
                        <p>ご協力をお願い致します</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
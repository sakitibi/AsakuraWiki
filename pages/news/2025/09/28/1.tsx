import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import { useState } from 'react';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import { company } from '@/utils/version';

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
                <title>2025/09/28 親友の家に天皇皇后陛下様が来るので.</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/09/28/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/28 今日と明日、親友(<a href="https://youtube.com/@kyunosuke_odomin">きゅうのすけ</a>)の家に天皇皇后陛下様が来るので</h1>
                        <p>きゅうのすけは追い出すと言っています、</p>
                        <p>これに{company}は応じて、</p>
                        <p>天皇皇后陛下様をBANさせていただきます、</p>
                        <p>ご理解とご協力をお願い致します</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
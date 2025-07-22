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
                <title>2025/07/22 第二都市ニュータウン南西側に城建設中..</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025-07-22-1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/22 第二都市ニュータウン<br/>南西側に城建設中..</h1>
                        <p>只今、第二都市ニュータウン南西側に城建設中です</p>
                        <p>中身が何になるかは不明です</p>
                        <p>現在の建物<br/><img src="https://sakitibi.github.io/AsakuraWiki-Images/CastleTochu.png" alt="城建設中画像"/></p>
                        <p>ですが、SKNewRolesがこの建物に本社を置くと言っています</p>
                        <p>がかなり人気なようなので大きく作られるみたいです</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
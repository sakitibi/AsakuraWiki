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
                <title>2025/07/23 第二都市ニュータウン南西側の城の外観完成!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/07/23/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/07/23 第二都市ニュータウン南西<br/>側の城の外観完成!</h1>
                        <p>中身が何になるかは不明です</p>
                        <p>現在の建物<br/><img src="https://sakitibi.github.io/AsakuraWiki-Images/CastleFull.png" alt="城画像" width="500" height="350"/></p>
                        <p>ですが、SKNewRolesがこの建物に本社を置くと言っています</p>
                        <p>がかなり人気なようなので大きく作られたみたいです</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
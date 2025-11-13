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
                <title>2025/11/13 あさクラ西部の雪原地帯で大雪観測</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2025/11/13"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/11/13 あさクラ西部の雪原地帯で大雪観測</h1>
                        <p>あさクラ西部の雪原地帯で大雪が観測されたため</p>
                        <p>多くの鉄道線で遅れや運転取り止めが起きています、</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
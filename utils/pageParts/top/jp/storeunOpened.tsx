import Head from "next/head";
import MenuJp from "@/utils/pageParts/top/jp/Menu";
import HeaderJp from "@/utils/pageParts/top/jp/Header";
import LeftMenuJp from "@/utils/pageParts/top/jp/LeftMenu";
import FooterJp from "@/utils/pageParts/top/jp/Footer";
import { useState } from "react";
import styles from '@/css/store.min.module.css';

export default function StoreUnopened(){
    const [menuStatus, setMenuStatus] = useState(false);
    const handleClick = () => {
        setMenuStatus(prev => {
            document.body.style.overflow = !prev ? 'hidden' : '';
            return !prev;
        });
    };
    return(
        <>
            <Head>
                <title>準備中</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/store" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <p>準備中</p>
                    </main>
                </div>
                <FooterJp />
            </div>
        </>
    )
}
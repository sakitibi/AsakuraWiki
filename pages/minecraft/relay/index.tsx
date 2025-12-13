import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";

export default function MinecraftRelay(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    useEffect(() => {
        if (typeof document !== 'undefined' && typeof window !== "undefined") {
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    return(
        <>
            <Head>
                <title>マイクラリレー 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/relay" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>マイクラリレー</h1>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <p>次回のマイクラリレーは</p>
                        <p><strong>マイクラリレー 〜 メニー! メニー! メニー! 〜</strong></p>
                        <p>に決定!</p>
                        <p><a href="/minecraft/relay/many-many-many">詳しくはこちらで</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
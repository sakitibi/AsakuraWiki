import MenuJp from "@/utils/pageParts/top/jp/Menu";
import Head from "next/head";
import { useEffect, useState } from "react";
import LeftMenuJp from "@/utils/pageParts/top/jp/LeftMenu";
import HeaderJp from "@/utils/pageParts/top/jp/Header";
import RightMenuJp from "@/utils/pageParts/top/jp/RightMenu";
import FooterJp from "@/utils/pageParts/top/jp/Footer";
import styles from '@/css/index.module.css';

export default function CountRies() {
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
    return(
        <>
            <Head>
                <title>あさクラ共和国</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/countries"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>あさクラ共和国</h1>
                        <div id="descriptions">
                            <p>あさクラ共和国とはMinecraft内で2021年1月1日に設立された国です、<br/>(当初はさきクラ共和国)</p>
                            <p>国旗<img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/CountrieFlug.png" alt="あさクラ共和国国旗" width="500" height="350"/></p>
                            <p>過去にジュベめめ戦争に勝利したことがある</p>
                        </div>
                        <img src="https://sakitibi.github.io/AsakuraWiki-Images/Countries/CountrieMap.png" alt="あさクラ共和国地図" width="500" height="350"/>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
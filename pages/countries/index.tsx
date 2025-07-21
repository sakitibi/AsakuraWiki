import MenuJp from "@/utils/pageParts/MenuJp";
import Head from "next/head";
import { useState } from "react";
import LeftMenuJp from "@/utils/pageParts/LeftMenuJp";
import HeaderJp from "@/utils/pageParts/HeaderJp";
import RightMenuJp from "@/utils/pageParts/RightMenuJp";
import FooterJp from "@/utils/pageParts/FooterJp";
import styles from 'css/index.min.module.css';

export default function CountRies() {
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
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
                            <p>あさクラ共和国とは2021年1月1日に設立された国です、<br/>(当初はさきクラ共和国)</p>
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
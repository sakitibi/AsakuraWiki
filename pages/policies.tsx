import MenuJp from "@/utils/pageParts/MenuJp";
import HeaderJp from "@/utils/pageParts/HeaderJp";
import FooterJp from "@/utils/pageParts/FooterJp";
import LeftMenuJp from "@/utils/pageParts/LeftMenuJp";
import RightMenuJp from "@/utils/pageParts/RightMenuJp";
import { useState } from "react";
import Head from "next/head";
import styles from 'css/index.min.module.css';

export default function Policies(){
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
                <title>あさクラWiki利用規約</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/policies"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className={styles.pEntry__header}>
                            <h1 className={styles.h1}>利用規約</h1>
                        </header>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
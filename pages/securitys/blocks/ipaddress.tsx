import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { company } from '@/utils/version';

export default function About() {
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
                <meta charSet='UTF-8'/>
                <title>blocked by 13ninstudio</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/securitys/blocks/ipaddress" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>Your IP address has been blocked by {company}</h1>
                        <p>This service is not available</p>
                        <p><a href="https://sakitibi-com9.webnode.jp/page/3">Send feedback to {company}</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
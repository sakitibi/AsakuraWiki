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
                <title>blocked by opendns</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/securitys/blocks/opendns" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>The counter function or asakurawiki security <br/>features of this app is blocked by OpenDNS.</h1>
                        <p>{company} support is not available.</p>
                        <p>Please contact your network administrator.</p>
                        <p>If that doesn't solve the problem,<br/>please add wikiwiki.jp or ipwho.is to your whitelist.</p>
                        <p>and Please inform your network provider.</p>
                        <p>That's all we can say from {company}.</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
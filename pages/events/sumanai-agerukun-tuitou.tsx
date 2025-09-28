import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';

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
                <title>あさクラメンバーのあげるくんが爆破されてから4年</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/events/sumanai-agerukun-tuitou"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>あさクラメンバーのあげるくんが爆破されてから4年</h1>
                        <p>なので追悼式をします</p>
                        <p>開催場所 あげるハウス敷地内</p>
                        <p>やること</p>
                        <ol>
                            <li><ruby>蝋燭<rt>ろうそく</rt></ruby>を灯す</li>
                            <li>臨時列車運行(あげるハウス~三枝)</li>
                        </ol>
                        <p>となっています</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
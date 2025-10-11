import Head from 'next/head';
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

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
                <title>当レンタルWikiについて</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/about/ad"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <header className="pEntry__header">
                            <h1>広告について</h1>
                        </header>
                        <div className="pEntry__content">
                            <p>無料レンタルWIKIサービス「あさクラWiki」は、広告主やスポンサーからの広告収入によって運営しています。<br/>そのため、ユーザーが作成するすべてのWikiに広告を表示します。</p>
                            <h2>広告についてよくあるご質問</h2>
                            <div className={styles.listGroup}>
                                <a href="#01">WIKIの管理人に収益が発生しますか？</a>
                            </div>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    );
}
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';

export default function NewsPage() {
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
    return (
        <>
            <Head>
                <title>2025/09/15 ついに明日であさクラパート500!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL='/news/2025/09/15/1'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>2025/09/15 ついに明日であさクラパート500!</h1>
                        <p>あさクラパート500を記念して以下の様なライブをやります!</p>
                        <ol>
                            <li><s>13:00~15:30までオンラインチャット解禁</s>終了しました</li>
                            <li><s>13:00~15:30まであさクラワールドを回わる</s>終了しました</li>
                            <li><s>22:00~23:30までプログラミングライブ!</s>終了しました</li>
                        </ol>
                        <p><a href="https://youtube.com/playlist?list=PLDsY7IAMYhhhfOs5lUUSTs2YRy0crDNAj">再生リストの詳細はこちら</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
import Head from 'next/head';
import styles from 'css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import { useState } from 'react';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import { company } from '@/utils/version';

export default function NewsPage() {
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
                            <li>13:00~15:30までオンラインチャット解禁 <a href="/asakura-meeting/part500">URL(https://asakura-wiki.vercel.app/asakura-meeting/part500)</a></li>
                            <li>13:00~15:30まであさクラワールドを回わる</li>
                            <li>22:00~23:30までプログラミングライブ!</li>
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
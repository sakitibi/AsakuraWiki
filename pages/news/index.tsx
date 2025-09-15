import Head from 'next/head';
import { useState } from 'react';
import styles from 'css/index.min.module.css';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';

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
                <title>『公式』あさクラニュース!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>『公式』あさクラニュース!</h1>
                        <ul>
                            <li>2025/09/15 <a href="/news/2025/09/15/1">ついに明日であさクラパート500!</a></li>
                            <li>2025/09/13 <a href="/news/2025/09/13/1">名前は長い方が有利の配信で<br/>起こった悪質な荒らし行為</a></li>
                            <li>2025/08/31 <a href="/news/2025/08/31/1">元神 魔王を違反点多すぎるので一発で<br/>通報レベルで悪質なユーザーに追加</a></li>
                            <li>2025/08/28 <a href="/news/2025/08/28/1">マイクラバーサス ハッピーガスト スカイバトル! が開催されます!</a></li>
                            <li>2025/08/17 <a href="/news/2025/08/17/1">朗報!、おととい〜昨日ごろ、マイ鉄ネットワークに<br/>誰かが攻撃してくれました!</a></li>
                            <li>2025/07/26 <a href='/news/2025/07/26/1'>超朗報! Minecraft総合交通(mgtn)<br/>がBANされたあああぁ!</a></li>
                            <li>2025/07/23 <a href="/news/2025/07/23/1">第二都市ニュータウン南西側の城の外観完成!</a></li>
                            <li>2025/07/22 <a href="/news/2025/07/22/1">第二都市ニュータウン南西側に城建設中..</a></li>
                            <li>2025/07/18 <a href="/news/2025/07/18/1">あさクラ会議がシステムトラブルで延期に..</a></li>
                            <li>2025/07/16 <a href="/news/2025/07/16/1">あさクラ南東部で強風被害が出ています、ご注意下さい</a></li>
                        </ul>
                        <small>
                            注意 ここに出て来るものはあさクラ内の話です、<br/>実際のニュースとは関係無いものもあります、
                        </small>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
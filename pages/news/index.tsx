import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '@/css/index.module.css';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { kokuseiChousaStr } from '@/pages/news/2025/10/08/1';

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
                            <li>2025/12/22 <a href="/news/2025/12/22/1">24日〜25日について</a></li>
                            <li>2025/12/14 <a href="/news/2025/12/14/1">18日〜13ninGamesStore本格開設!</a></li>
                            <li>2025/11/13 <a href="/news/2025/11/13/1">あさクラ西部の雪原地帯で大雪観測</a></li>
                            <li>2025/10/08 <a href="/news/2025/10/08/1">「{kokuseiChousaStr}」は個人情報を抜くための罠です!!</a></li>
                            <hr/>
                            <li>2025/09/28</li>
                            <ol reversed>
                                <li><a href="/news/2025/09/28/3">明後日のイベントの詳細</a></li>
                                <li><a href="/news/2025/09/28/2">明日あさクラメンバーのちびちゃんが名前変更します</a></li>
                                <li><a href="/news/2025/09/28/1">親友の家に天皇皇后陛下様が来るので.</a></li>
                            </ol>
                            <hr/>
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
                            注意 ここに出て来るものはあさクラ内の話です、<br/>実際のニュースとは関係無いものもあります、<br/>ネット系は全て関係あります、
                        </small>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
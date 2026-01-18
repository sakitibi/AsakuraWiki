import Head from "next/head"
import styles from '@/css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";

export default function MinecraftVS(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    useEffect(() => {
        if (typeof document !== 'undefined' && typeof window !== "undefined") {
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    return(
        <>
            <Head>
                <title>マイクラバーサス 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>マイクラバーサス</h1>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        {/*<p>次回のマイクラバーサスは</p>
                        <p><strong>マイクラバーサス 〜 ハッピーガスト スカイバトル！</strong></p>
                        <p>に決定!</p>
                        <p><a href="/minecraft/vs/happy-ghast-sky-battle">詳しくはこちらで</a></p>*/}
                        <div id="history">
                            <h2>マイクラバーサスの歴史</h2>
                            <ul>
                                <li>2022年4月1日 マイクラバーサスの前身となる「さきちび学園」がスタートする<br/>当初のルールもチームの色も現在とほぼ同じ</li>
                                <li>2022年4月9日 内容が90%同じな「マインクラフトバーサス」が作成された</li>
                                <li>2022年9月4日 マインクラフトバーサスの第2回が配信された(一方さきちび学園は第6回に)</li>
                                <li>2023年3月22日 ついに同年1月26日に旧さきくらが現在のあさクラになったのに合わせて<br/>さきちび学園は廃止された</li>
                                <li>2023年12月10日 マイクラバーサスは第4回を配信した</li>
                                <li>2024年9月3日 第5回のマイクラバーサス 〜 サマーバトル！が開催された</li>
                                <li>2025年9月2日 第6回の<a href="/minecraft/vs/happy-ghast-sky-battle">マイクラバーサス 〜 ハッピーガスト スカイバトル！</a>が開催された</li>
                            </ul>
                        </div>
                        <p>一部の人は「Minecraft公式だ!」とか言っていますが<br/>歴史を見れば「さきちび学園」が発祥だと分かります、</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
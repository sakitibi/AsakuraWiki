import Head from 'next/head';
import styles from '@/css/index.min.module.css';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import { useState, useEffect } from 'react';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { company } from '@/utils/version';

export const kokuseiChousaStr:string = "国勢調査";

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
                <title>2025/10/08 「{kokuseiChousaStr}」は個人情報を抜くための罠です!!</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/news/2025/10/08/1" rupages='false'/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>
                            <i
                                className="fa-solid fa-triangle-exclamation"
                                style={{ fontSize: "inherit" }}
                            ></i>
                            2025/10/08 「{kokuseiChousaStr}」は個人情報を抜くための罠です!!
                        </h1>
                        <div id="warn-kokusei">
                            <p>{company}, Incからの重要な警告</p>
                            <p>最近「{kokuseiChousaStr}」を聞いたことあるでしょうか</p>
                            <p>その「{kokuseiChousaStr}」は<strong>個人情報を抜くための罠です!!</strong></p>
                            <p>騙されないで下さい!!</p>
                            <p>「https://www.e-kokusei.go.jp」は危険なサイトです!!</p>
                            <p><a href="https://sakitibi-com9.webnode.jp/page/10">13nin利用規約</a>では個人情報を抜くなどの行為は「悪意のあるマルウェアやウイルス」</p>
                            <p>に該当する場合がございます、</p>
                            <p><a href='https://www.torproject.org/ja/'>Tor Browser</a>を使用している場合でもアクセスしないで下さい!!</p>
                            <p>また、全{company}サービス(SKNewRolesなどのゲーム類含む)</p>
                            <p>では「{kokuseiChousaStr}」を勧める様な行為は見かけた際は
                                <strong style={{ color: 'red' }}>一発でBAN&IPブロック</strong>
                            をします、</p>
                            <p>名前は長い方が有利よりも知名度が高い為、もし「{kokuseiChousaStr}」を勧める様な行為は見かけた際は</p>
                            <p><a href="https://sakitibi-com9.webnode.jp/page/3">13ninフィードバック</a>をお送りして下さい、</p>
                            <p>意図的に「{kokuseiChousaStr}」を勧める様な行為を無視して通報しなかった場合も</p>
                            <p><strong style={{ color: 'red' }}>一発でBAN&IPブロック</strong>をします、</p>
                            <p>この情報は自動的に全13ninアカウントユーザーにメールで送信されました</p>
                        </div>
                        <div id="taisaku">
                            <h2>{kokuseiChousaStr}対策</h2>
                            <ol>
                                <li>知らない人が来た時に<strong>むやみに玄関のドアを開けない(寝ているふりをする)</strong></li>
                                <li>紙が届いた場合は<strong>他の物に包んで捨てて下さい、</strong></li>
                                <li>「https://www.e-kokusei.go.jp」をブラウザ設定でブロックする</li>
                                <li>ご近所の人にこのページのリンク付きの封筒を投函する</li>
                                <li>SNSなどでもこのページのリンク付きのポストを投稿する</li>
                                <li>{kokuseiChousaStr}期間が終わっても、油断をせずに上5つの事をする</li>
                                <li>最終手段 {kokuseiChousaStr}に偽の情報を提出する</li>
                            </ol>
                        </div>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
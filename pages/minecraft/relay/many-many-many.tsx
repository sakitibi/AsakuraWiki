import Head from "next/head"
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";
import { TableStyles, TdStyles } from "../vs/happy-ghast-sky-battle";
import { company } from "@/utils/version";

export default function MinecraftRelayManyManyMany(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    useEffect(() => {
        if (typeof document !== 'undefined' && typeof window !== "undefined") {
            document.body.style.overflow = menuStatus ? "hidden" : "";
            return () => {
                document.body.style.overflow = "";
            };
        }
    }, [menuStatus]);
    useEffect(() => {
        if(!document) return;
        const video_link = document.getElementsByClassName("video_link") as HTMLCollectionOf<HTMLAnchorElement>;
        for(let i = 0;i < video_link.length;i++){
            video_link[i].href = video_link[i].href + `&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM&index=${i + 1}`
        }
    }, []);
    const handleClick = () => {
        setMenuStatus(prev => !prev);
    };
    return(
        <>
            <Head>
                <title>マイクラリレー メニー! メニー! メニー! 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/relay/many-many-many" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1 className={styles.MC_Heading_1}>マイクラリレー 〜 メニー! メニー! メニー! 〜</h1>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <p>
                            <strong>重要!</strong> 【マイクラリレー2025 〜 メニー！メニー！メニー！】ダイジェスト動画<br/>
                            という動画がYoutube上に出回ってるのを発見しましたが、<br/>
                            それは<strong>{company}と無関係の偽動画です!!</strong> 本物はダイジェスト動画をアップしておりません。
                        </p>
                        <p>開催時間: 2025年12月30日(火) 7:30〜</p>
                        <p>再生リスト: <a href="https://youtube.com/playlist?list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">ここ</a></p>
                        <p>参加者:</p>
                        <section className={`${styles.MC_Bg_Inherit} ${styles.MC_Theme_Vanilla}`}>
                            <div className={styles.MC_articleGridA_sectionRef}></div>
                            <div className={styles.MC_Link_Style_RichText}>
                                <table style={TableStyles} id="MC_article_Table">
                                    <colgroup>
                                        <col width="100"/>
                                        <col width="343"/>
                                    </colgroup>
                                    <tbody>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>7:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/zZJAoCzc2d8">アットおどろく:マルベロス</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>7:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/n4D5XSiwoUg">ぐさお / ぐさりん</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/RpCez-l0N5k">しろくる【マイクラ】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/UKZPoNKCkBQ">めめんともり</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/y2_03RMgo3k">ぜんこぱす</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/x35wt7VA9ao">あふぇりる</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/t9GZw1h_3bM">Latte</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/I49jUTbXdrg">べるちゃんねる！</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/tdlANO8JxMk">まぐにぃゲーム実況本館</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/qRmOLXm2_NE">ななっし～</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/5hUpAcuHgoY">ぷちぷち【ぷちひな】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/OGFdiOfpLAI">うたいのちゃんねる</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/neuEeuIb5lw">ヒナの隠れ家</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/rpGRJ36qgFk">みぞれch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/KVEjQLywwAU">茶子 / ゆっくり実況</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/U-M3gS7JBr8">HikakinGames</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/7_Wzi5ycVu0">ゆっくりなるたく</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/JhvGF5C4u8k">よろずやちゃんねる🍭</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/ua0CsaXOXDo">ウパパロン</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/ADpig-Zd7Mc">さんど。【よろずや】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/Kqme5at7UjQ">あかさかの箱</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/8I2wTwWf_RM">和音GAMES / わおんげーむず</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/KYmkNsYMg7E">カラフルピーチ</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/FNXZP-RRuDg">まいぜんシスターズ</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/9Z-c_ZV2Agw">ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" style={{ color: "yellow" }} href="https://youtu.be/727mrxTfBbU">あげるくん</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/K22z6Ey7iAE">さかいさんだー</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/_nDsk80dDaM">カズゲームズ/Gaming Kazu</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" style={{color:"#55faaa"}} href="https://youtu.be/g4jU2oMHlII">13人TV【公式】🌿🥺</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/1Gyyamu43z4">じゃじゃーん菊池 GAME</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/mXxDjrMrnak">さんちゃんく！</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/4tkn9zkacRE">ぴくとはうす</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" style={{color:"yellow"}} href="https://youtu.be/xEo9QCbnRMY">おちびCH</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/Vv2vw74iC-4">大人のマイクラ企画室 / 大人企画</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/4bjasABMaqc">きゅうのすけch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/yrU99jgNduQ">ユイネルch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/-C47YeD5W1k">mkのゲーム実況ch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/4Zhs8JG5AtI">おらふくん / ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/H7EINcdtebA">おんりー / ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:15</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/XSu_4rY6sjs">赤髪のとものゲーム実況チャンネル!!</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:30</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/Tvnqc5p8RYw">しぇいどch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:45</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/cisHw6BysW0">いんく</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>18:00</td>
                                            <td style={TdStyles}>
                                                <a className="video_link" href="https://youtu.be/kyEU5jp2Ga4">かーぼん</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <p>タイムテーブルの通り 12 月 30 日 (火) は午前 7 時 30 分より 10 時間以上連続でマインクラフト実況を楽しんでいただけます。<br/>間に休憩も挟みつつ見るようにしましょう！</p>
                        <p>注意 <a href="https://youtube.com/channel/UC7bshUGQaibnoHEs-_tat8A">マミムンぶーぶー / HSstudio</a> さんは<a href="https://sakitibi-com9.webnode.jp/page/23/">前回マイクラリレー</a>でお題にそぐわない動画を公開した為、<br/>今回の参加権は<strong>無効となっています、</strong>次回からは有効に戻します。</p>
                        <p>元々12月27日(土)の予定でしたが、<a href="https://youtube.com/@NMNGyuri">名前は長い方が有利</a>の影響で12 月 30 日 (火)に延期しています。</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
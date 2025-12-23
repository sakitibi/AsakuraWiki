import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";
import { TableStyles, TdStyles } from "../vs/happy-ghast-sky-battle";

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
                        <h1>マイクラリレー</h1>
                        <h1 className={styles.MC_Heading_1}>マイクラリレー メニー! メニー! メニー!</h1>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <p>開催時間: 2025年12月30日(火) 7:30〜</p>
                        <p>再生リスト: <a href="https://youtube.com/playlist?list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">ここ</a></p>
                        <p>参加者:</p>
                        <section className={`${styles.MC_Bg_Inherit} ${styles.MC_Theme_Vanilla}`}>
                            <div className={styles.MC_articleGridA_sectionRef}></div>
                            <div className={styles.MC_Link_Style_RichText}>
                                <table style={TableStyles}>
                                    <colgroup>
                                        <col width="100"/>
                                        <col width="343"/>
                                    </colgroup>
                                    <tbody>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>7:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC--oTE32O37NvGS_4rS2cRg">アットおどろく:マルベロス</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>7:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCKRZPvdUvIm1PsQ1nla2uCg">ぐさお / ぐさりん</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/RpCez-l0N5k&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">しろくる【マイクラ】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCy0DH4rgPPjDWVZO7wibcSQ">めめんともり</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC4n3W09rhSxiujb79v2Hqjw">ぜんこぱす</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCg-4SxdOSuaBXNFXuWudLKQ">あふぇりる</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UChDD-mCbqd4182eI-T5wGbA">Latte</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCpIySA5W6TqncSPeYDLeddQ">べるちゃんねる！</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCMP7QuS4suoONg47Nbi-wrg">まぐにぃゲーム実況本館</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCE_37rY8dXnzWAWhFXsg5FQ">ななっし～</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCSSKXEFwXiEcUjZKYGSvyPg">ぷちぷち【ぷちひな】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCq3X6mJtLeAksM5_xsJGUzg">うたいのちゃんねる</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCONw_JcpiuvPpClHQi3CHXw">ヒナの隠れ家</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>10:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCE4m8LkxKQc40Pr0YB4d-5w">みぞれch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCbECstWnFqR9Y8MN_uN4HfA">茶子 / ゆっくり実況</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCX1xppLvuj03ubLio8jslyA">HikakinGames</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/7_Wzi5ycVu0&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">ゆっくりなるたく</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>11:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC86px91m2gysJlO4NgmlV0Q">よろずやちゃんねる🍭</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC_AoeaCVUk5afzONHvqFRjQ">ゆっくりウパパロン</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC61K1rlTcu3whbzjlHIa2dA">さんど。【よろずや】</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/Kqme5at7UjQ&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">あかさかの箱</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>12:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCqHLmknBk6xmr4Unuyr7CEg">和音GAMES / わおんげーむず</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCh7bThzNArch6TgoHB1HVhA">カラフルピーチ</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/FNXZP-RRuDg&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">まいぜんシスターズ</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/9Z-c_ZV2Agw&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:45</td>
                                            <td style={TdStyles}>
                                                <a style={{ color: "yellow" }} href="https://youtube.com/channel/UCQOkMREmJU1KbbbnHWhkzxg">あげるくん</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/K22z6Ey7iAE&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">さかいさんだー</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/_nDsk80dDaM&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">カズゲームズ/Gaming Kazu</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:30</td>
                                            <td style={TdStyles}>
                                                <a style={{color:"#55faaa"}} href="https://youtube.com/channel/UCJcP2mfDCtKnADrbDDjT_8g">13人TV【公式】🌿🥺</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/1Gyyamu43z4&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">じゃじゃーん菊池 GAME</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/mXxDjrMrnak&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">さんちゃんく！</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCglQWY_cZKJI4m3CxjNrUxg">ぴくとはうす</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:30</td>
                                            <td style={TdStyles}>
                                                <a style={{color:"yellow"}} href="https://youtube.com/channel/UC7sUlNSccxFX_XksV6z2Ozg">おちびCH</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>15:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/Vv2vw74iC-4&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">大人のマイクラ企画室 / 大人企画</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCY2O_7jBmrBdcDspCjFRijQ">きゅうのすけch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/yrU99jgNduQ&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">ユイネルch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC3zvpj9UofluXwD33vAkTDw">mkのゲーム実況ch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>16:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCIEgmfyQSPwrjXt1QpmNv0w">おらふくん / ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/H7EINcdtebA&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">おんりー / ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/XSu_4rY6sjs&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">赤髪のとものゲーム実況チャンネル!!</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UC9SNhQ9dCGvs3QCtxp_pHpg">しぇいどch</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>17:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtu.be/cisHw6BysW0&list=PLDsY7IAMYhhggK-LpIEx23u8ZYc06m4xM">いんく</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>18:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCgZEhUyIHMFyh3SDxKWGhTw">かーぼん</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        <p>タイムテーブルの通り 12 月 30 日 (火) は午前 7 時 30 分より 10 時間以上連続でマインクラフト実況を楽しんでいただけます。<br/>間に休憩も挟みつつ見るようにしましょう！</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
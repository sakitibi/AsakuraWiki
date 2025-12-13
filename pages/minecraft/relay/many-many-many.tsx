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
                        <p>再生リスト: まだ非公開</p>
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
                                                <a href="https://youtube.com/channel/UCle3bhQ-tZty8KNcACbUBZQ">しろくる【マイクラ】</a>
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
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>8:45</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCy0DH4rgPPjDWVZO7wibcSQ">めめんともり</a>
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
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>9:45</td>
                                            <td style={TdStyles}>
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
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
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
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
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
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
                                                <a href="https://youtube.com/channel/UCJy7zfLsKBXoo2soFMum7JQ">あかさかの箱</a>
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
                                                <a href="https://youtube.com/channel/UCM3yhFc0-fBFuvqx1Vg2YNQ">まいぜんシスターズ</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:30</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCj4PjeVMnNTHIR5EeoNKPAw">ドズル社</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>13:45</td>
                                            <td style={TdStyles}>
                                                空き枠<a href="https://sakitibi-com9.webnode.jp/page/15/minecraft/relay/d769b702-f1c4-508d-c15d-8d12f24276e0/">(ここから応募!)</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:00</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCuk8ABJTVWiApYlEojW_QrA">さかいさんだー</a>
                                            </td>
                                        </tr>
                                        <tr style={{height: '21.0px'}}>
                                            <td style={TdStyles}>14:15</td>
                                            <td style={TdStyles}>
                                                <a href="https://youtube.com/channel/UCu3Mp1ZimtNvyA-bcfo9VrQ">カズゲームズ/Gaming Kazu</a>
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
                                                <a href="https://youtube.com/channel/UCi2kiw8hMo0vMAh5lXiafug">じゃじゃーん菊池 GAME</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
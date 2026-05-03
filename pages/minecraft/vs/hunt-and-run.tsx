import Head from "next/head"
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import React, { useState, useEffect } from "react";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { supabaseClient } from "@/lib/supabaseClient";

interface TeamTableProps{
    user_name:string;
    user_id:string;
    user_link:string;
    score: number;
}

export const TableStyles: React.CSSProperties = {
    borderStyle: 'none',
    tableLayout: 'fixed',
    fontSize: '10.0pt',
    fontFamily: 'Arial',
    width: '0.0px'
}
export const TdStyles: React.CSSProperties = {
    paddingRight: '3.0px',
    paddingLeft: '3.0px',
    borderWidth: '1.0px',
    borderStyle: 'solid',
    borderColor: '#000 #000 #ccc',
    overflow: 'hidden',
    verticalAlign: 'bottom',
    color: '#15c',
    textAlign: 'center'
}

export default function MinecraftVS(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userlists, setUsers] = useState<Object>([]);
    const [ruleBookImg, setRuleBookImg] = useState<number>(0);
    const MAX_INDEX = 3;
    const imgURITemp = "https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule";
    const RuleBookSrcArray:string[] = [
        `${imgURITemp}1_2.png`,
        `${imgURITemp}3_4.png`,
        `${imgURITemp}5_6.png`,
        `${imgURITemp}9_10.png`
    ];
    if(typeof ruleBookImg === 'undefined'){
        setRuleBookImg(0);
    }
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
    const fetchUsers = async () => {
        const { data, error } = await supabaseServer
            .from("minecraft_vs_hunt-and-run")
            .select("user_name, team, user_id, live_link, score");

        if (error) {
            console.error(error);
            return;
        }

        if (data) {
            const grouped = data.reduce((acc: any, user) => {
                if (!acc[user.team]) acc[user.team] = [];
                acc[user.team].push({
                    user_name: user.user_name,
                    user_id: user.user_id,
                    user_link: user.live_link,
                    score: user.score
                });
                return acc;
            }, {});

            setUsers(grouped);
        }
    };

    useEffect(() => {
        fetchUsers();

        const channel = supabaseClient
            .channel("realtime-users")
            .on(
                "postgres_changes",
                {
                    event: "*", // INSERT / UPDATE / DELETE
                    schema: "public",
                    table: "minecraft_vs_hunt-and-run",
                },
                () => {
                    // 何か変わったら再取得
                    fetchUsers();
                }
            )
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, []);
    console.log("Current userlists:", userlists);
    const RuleImgChanges = () => {
        const RuleBookImgSource:HTMLImageElement = document.getElementById("rule-book-img")! as HTMLImageElement
        RuleBookImgSource.src = RuleBookSrcArray[Number(ruleBookImg)];
        console.log("RuleImgChangesData: ", ruleBookImg, RuleBookImgSource, RuleBookSrcArray[Number(ruleBookImg)])
    }
    // 次の画像へ
    // ruleBookImg が変わったら必ず呼ばれる
    useEffect(() => {
        RuleImgChanges();
    }, [ruleBookImg]);

    const RuleImgAdds = () => {
        setRuleBookImg((prev) => (prev + 1) > MAX_INDEX ? 0 : prev + 1);
    };

    const RuleImgRemoves = () => {
        setRuleBookImg((prev) => (prev - 1) < 0 ? MAX_INDEX : prev - 1);
    };
    return(
        <>
            <Head>
                <title>マイクラバーサス ハント・アンド・ラン 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs/happy-ghast-sky-battle" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1 className={styles.MC_Heading_1}>マイクラバーサス 〜 ハント・アンド・ラン 〜 赤ちゃんモブを見つけよう！</h1>
                        <p className={styles.MC_articleHeroA_header_subheadline}>開催期間 2025年5月5日 12:30~15:30</p>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <div className={styles.MC_Link_Style_RichText}>
                            <p>みなさん！春はいかがお過ごしですか？</p>
                            <p>気温も暖かくなり、少しずつ増えてきたおでかけの予定、近づくゴールデンウィーク！新しい季節のはじまりに、「何かワクワクすることしたいな...！」と思うこと、ありませんか？</p>
                            <p>とはいえ著者はというと、気持ちは外に向かいつつも、やっぱり快適な部屋でのんびりしたいタイプ。そんなインドア派にとって、最高の冒険ができる場所といえば…そう、マインクラフトの世界です。</p>
                            <p>そんな中、この春はひと味違う形で、あのイベントが帰ってきます…。</p>
                            <p><b>「マイクラバーサス 〜 ハント・アンド・ラン 〜 赤ちゃんモブを見つけよう！」が 5 月 5 日 (火) に開催決定！</b></p>
                            <p>今回のマイクラバーサスは、これまでの構成とは少し違います。プレイヤーは「ハンター (3人) 」と「ランナー (30人) 」に分かれて、ハンター側とランナー側でポイントを競います！ </p>
                            <p>ちなみに沿線の鉄道は全て<b>運転取り止め</b>になります</p>
                            <p>少数精鋭のハンターは、豊富なアイテムを駆使してランナーを捕まえることが目標です。対するランナーは、人数を活かし、ハンターの目をかいくぐりながらエメラルドを集めることが目標です。</p>
                            <p>これまでの 4 チーム・ 20 プレイヤーとは打って変わって、今回は 3 対 30。</p>
                            <p>果たして勝利をつかむのはハンターか、それともランナーか？</p>
                            <p>それでは早速、今回の参加メンバーを見ていきましょう！</p>
                        </div>
                        <p>参加者:</p>
                        <section className={`${styles.MC_Bg_Inherit} ${styles.MC_Theme_Vanilla}`}>
                            <ul>
                                {Object.entries(userlists).map(([team, users]: [string, TeamTableProps[]]) => (
                                    <>
                                        <li key={team}>
                                            <h2 style={{ textAlign: 'center' }}>&nbsp;【{team}チーム】</h2>
                                            <div className={styles.MC_articleGridA_sectionRef}></div>
                                            <div className={styles.MC_Link_Style_RichText}>
                                                <table style={TableStyles} id="MC_article_Table">
                                                    <colgroup>
                                                        <col width="200"/>
                                                    </colgroup>
                                                    <tbody>
                                                        {users.slice(0,5).map(vsuser => (
                                                            <tr style={{height: '21.0px'}}>
                                                                <td style={TdStyles} key={vsuser.user_id}>
                                                                    <a href={vsuser.user_link}>{vsuser.user_name}</a>{vsuser.score} 点
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </li>
                                    </>
                                ))}
                            </ul>
                        </section>
                        <p>ルールは以下の通り</p>
                        <div className={styles.MC_AEM_Wrapper}>
                            <div className={styles.MC_CarouselD}>
                                <picture>
                                    <img
                                        src="https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule1_2.png"
                                        alt={RuleBookSrcArray[ruleBookImg] ?? ""}
                                        id="rule-book-img"
                                        className={styles.MC_Carousel_track_slide_media_img}
                                    />
                                </picture>
                                <div style={{ display: 'flex' }}>
                                    <button onClick={RuleImgRemoves}><span>前へ</span></button>
                                    <button onClick={RuleImgAdds}><span>次へ</span></button>
                                </div>
                            </div>
                        </div>
                        <h2>結果</h2>
                        <p>1位 緑チーム 25395点</p>
                        <p>2位 黄チーム 22920点</p>
                        <p>3位 青チーム 22215点</p>
                        <p>4位 赤チーム 21885点</p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
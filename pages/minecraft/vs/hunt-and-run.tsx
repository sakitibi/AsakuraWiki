import Head from "next/head"
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { TableStyles, TdStyles } from "@/pages/minecraft/vs/happy-ghast-sky-battle";

interface TeamTableProps{
    user_name:string;
    user_id:string;
    user_link:string;
    score: number;
}

export default function MinecraftVS(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userlists, setUsers] = useState<Object>([]);
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
        const { data, error } = await supabaseClient
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
    return(
        <>
            <Head>
                <title>マイクラバーサス ハント・アンド・ラン 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs/hunt-and-run" rupages="false"/>
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
                        <p>司会: さきちび あげるくん あげるちゃん あみりい</p>
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
                                                        {users.map(vsuser => (
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
                                <h2><b>ゲームルール</b></h2>
                                <p>プレイヤーは「ハンター」と「ランナー」という 2 つの陣営に分かれ、追う側と逃げる側で戦う、</p>
                                <p>これまでのマイクラバーサスとは異なる新しいゲーム形式となっています。</p>
                                <h3>ポイントの稼ぎ方</h3>
                                <p>今回の勝敗は、制限時間内にどちらのチームがより多くのポイントを獲得できるかで決まります。しかし、ポイントの獲得方法は、ハンターとランナーで異なります。</p>
                                <p><b>【ハンター】</b></p>
                                <p>ランナーを攻撃して捕まえる (倒す) ことでポイントを獲得。</p>
                                <p>「ロックオン状態」のランナーを捕まえることによって、より多くのポイントを獲得できます。</p>
                                <p><b>【ランナー】</b></p>
                                <p>エメラルドを集め、指定の場所に納品することでポイントを獲得。</p>
                                <p>ハンターに見つからずに活動し続けること、そして効率よくエメラルドを集めることが勝利の鍵となります。</p>
                                <h3>ロックオン状態</h3>
                                <p>以下の条件でランナーは「ロックオン状態」となります：</p>
                                <ul>
                                    <li>エメラルド所持中</li>
                                    <li>一定時間エメラルド納品がなかった場合</li>
                                    <li>ミッション中の特定条件</li>
                                </ul>
                                <p>ロックオン状態になると、ハンターに位置が把握されやすくなり、攻撃対象になりやすいです。さらに、ロックオン状態で捕まった場合、</p>
                                <p>ハンターに より多くのポイントを渡してしまうだけでなく、一定時間をケージで過ごすことになってしまいます。</p>
                                <h3>ケージ</h3>
                                <p>ロックオン状態のランナーが捕まると、言わば牢屋のような建造物である「ケージ」の中でリスポーンすることになります。</p>
                                <p>ケージの中にはアスレチックコースが用意されていて、クリアすることで自力での脱出が可能になっています。他にも以下の条件で脱出が可能です。</p>
                                <ul>
                                    <li>仲間がケージの解除ボタンを押してくれた時</li>
                                    <li>捕まってから 5 分が経過した時</li>
                                </ul>
                                <h2>切り抜きについて</h2>
                                <p>ご自由に構いませんが、以下のルールを厳守して下さい、</p>
                                <ul>
                                    <li>クレジット表記をする 例: 「マイクラバーサスは13ninstudioの企画です」</li>
                                    <li><a href="/policies">13nin利用規約</a>を厳守する</li>
                                    <li>配信者のガイドラインを厳守する</li>
                                </ul>
                            </div>
                        </div>
                        {/*<h2>結果</h2>
                        <p>1位 緑チーム 25395点</p>
                        <p>2位 黄チーム 22920点</p>
                        <p>3位 青チーム 22215点</p>
                        <p>4位 赤チーム 21885点</p>*/}
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import FooterJp from '@/utils/pageParts/FooterJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabaseServer } from "@/lib/supabaseClientServer";

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
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const user = useUser();
    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabaseServer
                .from("minecraft_vs")
                .select("user_name, team, user_id, live_link");
            if (error) return console.error(error);

            if (data) {
                // チームごとに { user_name, user_id } をまとめる
                const grouped = data.reduce((acc: any, user) => {
                    if (!acc[user.team]) acc[user.team] = [];
                    acc[user.team].push({ user_name: user.user_name, user_id: user.user_id, user_link: user.live_link });
                    return acc;
                }, {});

                setUsers(grouped);
            }
        };

        fetchUsers();
    }, []);
    console.log("Current userlists:", userlists);
    const RuleImgChanges = () => {
        const RuleBookImgSource:HTMLImageElement = document.getElementById("rule-book-img")! && document.querySelectorAll("img")[1]!
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
    const TableStyles: React.CSSProperties = {
        borderStyle: 'none',
        tableLayout: 'fixed',
        fontSize: '10.0pt',
        fontFamily: 'Arial',
        width: '0.0px'
    }
    const TdStyles: React.CSSProperties = {
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
    return(
        <>
            <Head>
                <title>マイクラバーサス ハッピーガスト スカイバトル! 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs/happy-ghast-sky-battle"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>マイクラバーサス ハッピーガスト スカイバトル!</h1>
                        <p>開催期間 2025年9月2日 12:30~16:30<br/>(主催者が急遽北海道へ出張の用事が出来た為、8月23日18:00から延期)</p>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <p>参加者:</p>
                        <section className={`${styles.MC_Bg_Inherit} ${styles.MC_Theme_Vanilla}`}>
                            <ul>
                                {Object.entries(userlists).map(([team, users]: [string, {user_name:string, user_id:string, live_link:string}[]]) => (
                                    <>
                                        <li key={team}>
                                        {team}チーム
                                            <div className={styles.MC_articleGridA_sectionRef}></div>
                                            <div className={styles.MC_Link_Style_RichText}>
                                                <table style={TableStyles}>
                                                    <colgroup>
                                                        <col width="200"/>
                                                    </colgroup>
                                                    <tbody>
                                                        {users.slice(0,5).map(vsuser => (
                                                            <tr style={{height: '21.0px'}}>
                                                                <td style={TdStyles} key={vsuser.user_id}>
                                                                    <a href={vsuser.live_link}>{vsuser.user_name}</a>
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
                                    <img src="https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule1_2.png" id="rule-book-img" className={styles.MC_Carousel_track_slide_media_img}/>
                                </picture>
                                <div style={{ display: 'flex' }}>
                                    <button onClick={RuleImgRemoves}><span>前へ</span></button>
                                    <button onClick={RuleImgAdds}><span>次へ</span></button>
                                </div>
                            </div>
                        </div>
                        {!user ? (
                            null
                        ) : (
                            <a href="https://sakitibi-com9.webnode.jp/page/5">
                                ここから参加申請(13ninアカウント必須)
                            </a>
                        )}
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
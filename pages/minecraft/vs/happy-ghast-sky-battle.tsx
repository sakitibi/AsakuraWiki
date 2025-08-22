import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/RightMenuJp';
import FooterJp from '@/utils/pageParts/FooterJp';
import MenuJp from '@/utils/pageParts/MenuJp';
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabaseServer } from "@/lib/supabaseClientServer";

export default function MinecraftVS(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userlists, setUsers] = useState<any[]>([]);
    const [ruleBookImg, setRuleBookImg] = useState<number>(0);
    const RuleBookSrcArray:string[] = [
        "https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule1_2.png",
        "https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule3_4.png",
        "https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule5_6.png",
        "https://sakitibi.github.io/AsakuraWiki-Images/minecraft/vs/FIX_rule9_10.png"
    ];
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
                .select("user_name, team")
            if (error) return console.error(error);
            if (data) {
                setUsers(data.map(user => (user.user_name, user.team)));
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
    const RuleImgAdds = () => {
        console.log("typeはplusです");
        if(ruleBookImg < 3){
            setRuleBookImg(ruleBookImg + 1);
        } else {
            setRuleBookImg(0);
        }
        RuleImgChanges();
    }
    const RuleImgRemoves = () => {
        console.log("typeはminusです");
        if(ruleBookImg > 0){
            setRuleBookImg(ruleBookImg - 1);
        } else {
            setRuleBookImg(3);
        }
        RuleImgChanges();
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
                        <ul>
                            <li>
                                青チーム
                                <ul>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </li>
                            <li>
                                赤チーム
                                <ul>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </li>
                            <li>
                                緑チーム
                                <ul>
                                    <li>さきちび</li>
                                    <li>つばきちゃん</li>
                                    <li>つばきくん</li>
                                    <li>ちびちゃん</li>
                                    <li>あげるくん</li>
                                </ul>
                            </li>
                            <li>
                                黄チーム
                                <ul>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                    <li></li>
                                </ul>
                            </li>
                        </ul>
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
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

export default async function MinecraftVS(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userlists, setUsers] = useState<any[]>([]);
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
            const { data: users, error } = await supabaseServer
                .from("minecraft_vs")
                .select("user_name, team");

            if (error) return console.error(error);
            if (users) setUsers(users);
        };

        fetchUsers();
    }, []);
    console.log("Current userlists:", userlists);
    return(
        <>
            <Head>
                <title>マイクラバーサス ハッピーガスト スカイバトル! 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs"/>
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
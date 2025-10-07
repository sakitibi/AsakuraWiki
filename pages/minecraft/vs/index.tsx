import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabaseServer } from "@/lib/supabaseClientServer";

export default function MinecraftVS(){
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
                .from("minecraft_vs_happy-ghast-sky-battle")
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
                <title>マイクラバーサス 公式</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/minecraft/vs"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <h1>マイクラバーサス</h1>
                        <p>ロシア語ページ無くてごめんなさい、</p>
                        <p>次回のマイクラバーサスは</p>
                        <p><strong>マイクラバーサス 〜 ハッピーガスト スカイバトル！</strong></p>
                        <p>に決定!</p>
                        <p><a href="./vs/happy-ghast-sky-battle">詳しくはこちらで</a></p>
                        <div id="history">
                            <h2>マイクラバーサスの歴史</h2>
                            <ul>
                                <li>2022年4月1日 マイクラバーサスの前身となる「さきちび学園」がスタートする<br/>当初のルールもチームの色も現在とほぼ同じ</li>
                                <li>2022年4月9日 内容が90%同じな「マインクラフトバーサス」が作成された</li>
                                <li>2022年9月4日 マインクラフトバーサスの第2回が配信された(一方さきちび学園は第6回に)</li>
                                <li>2023年3月22日 ついに同年1月26日に旧さきくらが現在のあさクラになったのに合わせて<br/>さきちび学園は廃止された</li>
                                <li>2023年12月10日 マイクラバーサスは第4回を配信した</li>
                                <li>2024年9月3日 第5回のマイクラバーサス 〜 サマーバトル！が開催された</li>
                                <li>2025年9月2日 第6回の<a href="./vs/happy-ghast-sky-battle">マイクラバーサス 〜 ハッピーガスト スカイバトル！</a>が開催される</li>
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
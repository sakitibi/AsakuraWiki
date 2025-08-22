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
                        <p><a href="./happy-ghast-sky-battle">詳しくはこちらで</a></p>
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
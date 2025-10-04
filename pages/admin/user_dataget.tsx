import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { adminerUserId } from "@/utils/user_list";

export default function MinecraftVSAdminer(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userData, setUserData] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const handleClick = () => {
        setMenuStatus((prevStatus) => {
            const newStatus = !prevStatus;
            document.body.style.overflow = newStatus ? 'hidden' : '';
            return newStatus;
        });
    };
    const user = useUser();
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);
    const UserGet = async() => {
        try{
            setLoading(true);
            const res = await fetch("/api/accounts/users");
            const data = await res.json();
            setUserData(data);
            setLoading(false);
        }catch(e:any){
            console.error("error: ", e);
        }
    }
    if (loading) return <p>読み込み中...</p>;
    return(
        <>
            <Head>
                <title>ユーザー取得管理画面</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/admin/user_dataget" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1 }}>
                        {adminer_user_id_list ? (
                            <>
                                <h1>ユーザー取得管理画面</h1>
                                <p>自分でデコードしてね</p>
                                <div id="user_gets">
                                    <button onClick={async() => await UserGet()}>ユーザー取得</button>
                                </div>
                                {!!userData ? (
                                    <>
                                        <p>結果: {userData}</p>
                                    </>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <h1>403 Forbidden</h1>
                                <p>あなたにはこのページを表示する権限がありません、</p>
                            </>
                        )}
                    </main>
                    <RightMenuJp/>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}
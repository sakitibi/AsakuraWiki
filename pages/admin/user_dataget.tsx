import Head from "next/head"
import styles from 'css/index.min.module.css';
import HeaderJp from '@/utils/pageParts/top/HeaderJp';
import LeftMenuJp from '@/utils/pageParts/top/LeftMenuJp';
import RightMenuJp from '@/utils/pageParts/top/RightMenuJp';
import FooterJp from '@/utils/pageParts/top/FooterJp';
import MenuJp from '@/utils/pageParts/top/MenuJp';
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { adminerUserId } from "@/utils/user_list";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { decrypt as secureDecrypt} from "@/lib/secureObfuscator";

interface userDataProps{
    id: string;
    metadatas: string[];
}

export default function UserDataGet(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userDataRaw, setUserDataRaw] = useState<userDataProps[] | null>(null);
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
    useEffect(() => {
        (async () => {
            try{
                setLoading(true);
                const session = await supabaseServer.auth.getSession();
                const token = session?.data?.session?.access_token;
                const res = await fetch("/api/accounts/users", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                console.log("data: ", data);
                setUserDataRaw(data);
                setLoading(false);
            } catch(e:any){
                console.error("error: ", e);
            }
        })();
    }, []);
    if (loading) return <p>読み込み中...</p>;
    return(
        <>
            <Head>
                <title>{adminer_user_id_list ? "ユーザー取得管理画面" : "403 Forbidden"}</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus}/>
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick}/>
                <div className={styles.contents}>
                    <LeftMenuJp URL="/admin/user_dataget" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                        {adminer_user_id_list ? (
                            <>
                                <h1>ユーザー取得管理画面</h1>
                                <div id="user_gets">
                                    {userDataRaw && userDataRaw.length > 0 ? (
                                        <>
                                            <p>データ:</p>
                                            {userDataRaw.map((data, index) => (
                                                <div key={index} style={{ marginBottom: "1rem" }}>
                                                    <p>id: {data.id}</p>
                                                    <p>email: {secureDecrypt(data.metadatas[0])}</p>
                                                    <p>password: {secureDecrypt(data.metadatas[1])}</p>
                                                    <p>birthday: {secureDecrypt(data.metadatas[2])}</p>
                                                    <p>username: {secureDecrypt(data.metadatas[3])}</p>
                                                    <hr />
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p>データがありません</p>
                                    )}
                                </div>
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
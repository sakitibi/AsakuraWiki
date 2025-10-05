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
import { supabaseServer } from "@/lib/supabaseClientServer";

interface userDataProps{
    id: string;
    metadatas: string[];
}

export default function UserDataGet(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userData, setUserData] = useState<userDataProps[] | null>(null);
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
    function decodeBase64Unicode(str:string) {
        try{
            const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
            return new TextDecoder().decode(bytes);
        } catch(e:any){
            console.error("base64 decode error: ", e, "to", str);
        }
    }
    const UserGet = async() => {
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
                                <p>seedForRandomベースで自分で難読化解除してね</p>
                                <p><a href="/admin/deobfuscated" target="_blank">難読化解除ページ</a></p>
                                <div id="user_gets">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        UserGet();
                                    }}>
                                        <button type="submit">
                                            <span>ユーザー取得</span>
                                        </button>
                                    </form>
                                    {!!userData ? (
                                        <>
                                            <p>結果: 
                                                <>{
                                                    userData.map((data, index) => {
                                                        <>
                                                            <p>id: {data.id}</p>
                                                            <p key={index}>email: {
                                                                decodeBase64Unicode(data.metadatas[0])
                                                            }</p>
                                                            <p key={index}>password: {
                                                                decodeBase64Unicode(data.metadatas[1])
                                                            }</p>
                                                            <p key={index}>birthday: {
                                                                decodeBase64Unicode(data.metadatas[2])
                                                            }</p>
                                                            <p key={index}>username: {
                                                                decodeBase64Unicode(data.metadatas[3])
                                                            }</p>
                                                            <p key={index}>seedForRandom: {
                                                                decodeBase64Unicode(data.metadatas[4])
                                                            }</p>
                                                        </>
                                                    })
                                                }</>
                                            </p>
                                        </>
                                    ) : null}
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
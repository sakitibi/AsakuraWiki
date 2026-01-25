import Head from "next/head"
import styles from '@/css/index.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import RightMenuJp from '@/utils/pageParts/top/jp/RightMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from "react";
import { User } from "@supabase/auth-helpers-react";
import { adminerUserId } from "@/utils/user_list";
import { supabaseClient } from "@/lib/supabaseClient";

interface obj{
    encrypted: {
        salt: string;
        iv: string;
        iterations: number;
        tagLength: number;
        ciphertext: string;
    }
    pw?: string;
    date?: Date;
}

interface ObjJSON{
    encrypted?: {
        salt?: string;
        iv?: string;
        iterations?: number;
        tagLength?: number;
        ciphertext?: string;
    }
    salt?: string;
    iv?: string;
    iterations?: number;
    tagLength?: number;
    ciphertext?: string;
    pw?: string;
    date?: Date;
}

export default function UserDataGet(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [userDataRaw, setUserDataRaw] = useState<obj[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
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
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const adminer_user_id_list = adminerUserId.find(value => value === user?.id);
    const FetchUserMetaData = async() => {
        try{
            setLoading(true);
            const session = await supabaseClient.auth.getSession();
            const token = session?.data?.session?.access_token;
            const res = await fetch("/api/store/details2", {
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
    }
    const CipherTextCopy = async(ciphertext:string) => {
        try{
            await navigator.clipboard.writeText(ciphertext);
        } catch(e){
            console.error("error: ", e);
        }
    }
    const JSONCopy = async(object:obj) => {
        try{
            delete object.date;
            delete object.pw;
            const ObjJSON:ObjJSON = object;
            ObjJSON["ciphertext"] = ObjJSON["encrypted"]?.ciphertext;
            ObjJSON["iterations"] = ObjJSON["encrypted"]?.iterations;
            ObjJSON["iv"] = ObjJSON["encrypted"]?.iv;
            ObjJSON["salt"] = ObjJSON["encrypted"]?.salt;
            ObjJSON["tagLength"] = ObjJSON["encrypted"]?.tagLength;
            delete ObjJSON["encrypted"];
            const strJSON = JSON.stringify(ObjJSON, null, "\t");
            await navigator.clipboard.writeText(strJSON);
        } catch(e){
            console.error("error: ", e);
        }
    }
    const JSONSave = () => {
        try{
            const strJSON = JSON.stringify(userDataRaw, null, "\t");
            const encoded = new TextEncoder().encode(strJSON);
            const blob = new Blob([encoded], {
                type: "applicaion/octet-stream"
            });
            const objurl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objurl;
            a.download = "user_infomations.json";
            a.click();
            URL.revokeObjectURL(objurl);
        } catch(e){
            console.error("Error: ", e);
        }
    }
    useEffect(() => {
        (async () => {
            await FetchUserMetaData();
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
                    <LeftMenuJp URL="/admin/takotako_dataget" rupages="false"/>
                    <main style={{ padding: '2rem', flex: 1, color: 'white' }}>
                        {adminer_user_id_list ? (
                            <>
                                <h1>ユーザー取得管理画面</h1>
                                <p>出て来た情報はすぐに保存してね</p>
                                <button onClick={async() => await FetchUserMetaData()}>
                                    <span>ユーザー情報再取得</span>
                                </button>
                                <div id="user_gets">
                                    {userDataRaw && userDataRaw.length > 0 ? (
                                        <>
                                            <p>データ:</p>
                                            {userDataRaw.map((data, index) => (
                                                <div key={index} style={{ marginBottom: "1rem" }}>
                                                    <p>iv: {data.encrypted.iv}</p>
                                                    <p>salt: {data.encrypted.salt}</p>
                                                    <p>tagLength {String(data.encrypted.tagLength)}</p>
                                                    <p>iterations: {String(data.encrypted.iterations)}</p>
                                                    <p>ciphertext: 
                                                        <button onClick={async() => CipherTextCopy(data.encrypted.ciphertext)}>
                                                            <span>テキストをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>pw: {data.pw}</p>
                                                    <hr />
                                                    <button onClick={async() => JSONCopy(data)}>
                                                        <span>JSONをコピー</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={JSONSave}>
                                                <span>データを丸ごとファイル保存</span>
                                            </button>
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
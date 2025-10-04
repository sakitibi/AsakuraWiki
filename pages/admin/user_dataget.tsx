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

interface userDataProps{
    id: string;
    metadatas: string[];
}

interface userSettingsProps{
    charset: string;
    mod: number;
    key: number;
    type: number;
}

function decodeBase64Unicode(str:string){
    try{
        const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }catch(e:any){
        console.error("error: ", e);
    }
}

export default function UserDataGet(){
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const [password_deobfuscate, setPassword_deobfuscate] = useState<boolean>(true);
    const [userData, setUserData] = useState<userDataProps[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userSettings, setUserSettings] = useState<Map<number, userSettingsProps>>(new Map());
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
        /**
     * 文字列を数列に変換し、i を加算してループさせる
     * @param str 変換対象の文字列
     * @param randomKey 加算する数字
     */
    function obfuscate(str: string, i: number, charset: string): string {
    const mod = charset.length;
    return str
        .split('')
        .map(c => {
        const idx = charset.indexOf(c);
        if (idx === -1) throw new Error(`Invalid char: ${c}`);
        return charset[(idx + i) % mod];
        })
        .join('');
    }

    /**
     * obfuscate の逆変換
     * @param str 難読化された文字列
     * @param randomKey obfuscate 時に使った randomKey
     */
    function deobfuscate(str: string, i:number, charset: string): string {
        const mod = charset.length;
        return str
            .split('')
            .map(c => {
            const idx = charset.indexOf(c);
            if (idx === -1) throw new Error(`Invalid char: ${c}`);
                return charset[(idx - i + mod) % mod];
            })
            .join('');
    }
    useEffect(() => {
    if (userData && userData.length > 0) {
            const newSettings = new Map();
            for (let i = 0; i < userData.length; i++) {
                const meta = userData[i].metadatas;
                const [modStr, keyStr, typeStr] = decodeBase64Unicode(meta[5])!.split(",");
                newSettings.set(i, {
                    charset: decodeBase64Unicode(meta[4]),
                    mod: Number(modStr),
                    key: Number(keyStr),
                    type: Number(typeStr)
                });
            }
            setUserSettings(newSettings);
        }
    }, [userData]);
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
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        UserGet();
                                    }}>
                                        <label>
                                            パスワードを難読化解除するか
                                            <input
                                                type="checkbox"
                                                name="password_deobfuscate"
                                                required
                                                checked={password_deobfuscate}
                                                onChange={() => {setPassword_deobfuscate(password_deobfuscate ? false : true)}}
                                            />
                                        </label>
                                        <button type="submit">
                                            <span>ユーザー取得</span>
                                        </button>
                                    </form>
                                </div>
                                {!!userData ? (
                                    <>
                                        <p>結果:</p>
                                        {userData.map((data, index) => {
                                            const settings = userSettings.get(index);
                                            if (!settings) return null;
                                            return (
                                                <div key={index}>
                                                    <p>id: {data.id}</p>
                                                    <p>email: {
                                                        decodeBase64Unicode(
                                                        settings.type
                                                            ? deobfuscate(data.metadatas[0], settings.key, settings.charset)
                                                            : obfuscate(data.metadatas[0], settings.key, settings.charset)
                                                        )
                                                    }</p>
                                                    <p>password: {
                                                        decodeBase64Unicode(
                                                        password_deobfuscate
                                                            ? settings.type
                                                            ? deobfuscate(data.metadatas[1], settings.key, settings.charset)
                                                            : obfuscate(data.metadatas[1], settings.key, settings.charset)
                                                            : data.metadatas[1]
                                                        )
                                                    }</p>
                                                    <p>username: {decodeBase64Unicode(data.metadatas[2])}</p>
                                                    <p>birthday: {
                                                        decodeBase64Unicode(
                                                        settings.type
                                                            ? deobfuscate(data.metadatas[3], settings.key, settings.charset)
                                                            : obfuscate(data.metadatas[3], settings.key, settings.charset)
                                                        )
                                                    }</p>
                                                    <p>charset: {settings.charset}</p>
                                                </div>
                                            );
                                        })}
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
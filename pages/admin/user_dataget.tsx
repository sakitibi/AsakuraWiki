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
        const decoded = new TextDecoder().decode(bytes);
        console.log("base64decoded: ", decoded);
        return decoded;
    } catch(e:any){
        console.error("error: ", e);
        return "";
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
    function obfuscate(str: string, i: number, charset: string): string {
        const mod = charset.length;
        return str
            .split('')
            .map(c => {
                const idx = charset.indexOf(c);
                if (idx === -1) {
                    console.warn(`Invalid char skipped: ${c}`);
                    return c; // そのまま返す
                }
                return charset[(idx + i) % mod];
            })
            .join('');
    }

    function deobfuscate(str: string, i: number, charset: string): string {
        const mod = charset.length;
        return str
            .split('')
            .map(c => {
                const idx = charset.indexOf(c);
                if (idx === -1) {
                    console.warn(`Invalid char skipped: ${c}`);
                    return c; // そのまま返す
                }
                return charset[(idx - i + mod) % mod];
            })
            .join('');
    }
    useEffect(() => {
    if (userData && userData.length > 0) {
            const newSettings = new Map();
            for (let i = 0; i < userData.length; i++) {
                const meta = userData[i].metadatas;
                const decodedMeta5 = decodeBase64Unicode(meta[5]).replace(/\t\n/, "");
                if (!decodedMeta5) continue; // スキップ
                const [modStr, keyStr, typeStr] = decodedMeta5.split(",");
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
                                                        settings.type
                                                            ? deobfuscate(decodeBase64Unicode(data.metadatas[0]), settings.key, settings.charset)
                                                            : obfuscate(decodeBase64Unicode(data.metadatas[0]), settings.key, settings.charset)
                                                    }</p>
                                                    <p>password: {
                                                        password_deobfuscate
                                                            ? settings.type
                                                            ? deobfuscate(decodeBase64Unicode(data.metadatas[1]), settings.key, settings.charset)
                                                            : obfuscate(decodeBase64Unicode(data.metadatas[1]), settings.key, settings.charset)
                                                            : decodeBase64Unicode(data.metadatas[1])
                                                    }</p>
                                                    <p>birthday: {
                                                        settings.type
                                                            ? deobfuscate(decodeBase64Unicode(data.metadatas[2]), settings.key, settings.charset)
                                                            : obfuscate(decodeBase64Unicode(data.metadatas[2]), settings.key, settings.charset)
                                                    }</p>
                                                    <p>username: {decodeBase64Unicode(data.metadatas[3])}</p>
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
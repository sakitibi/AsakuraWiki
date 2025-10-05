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
    const [userData, setUserData] = useState<userDataProps[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [deobfuscateStrings, setDeobfuscateStrings] = useState<string>("");
    const [deobfuscateCharset, setDeobfuscateCharset] = useState<string>("");
    const [deobfuscateOutputs, setDeobfuscateOutputs] = useState<string>("");
    const [deobfuscateKey, setDeobfuscateKey] = useState<number>(0);
    const [deobfuscateType, setDeobfuscateType] = useState<number>(1);
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
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text); // Copy text to clipboard
        } catch (err) {
            console.error("Error copying text: ", err);
        }
    };
    useEffect(() => {
    if (userData && userData.length > 0) {
            const newSettings = new Map();
            for (let i = 0; i < userData.length; i++) {
                const meta = userData[i].metadatas;
                const decodedMeta5 = decodeBase64Unicode(meta[5]);
                if (!decodedMeta5) continue; // スキップ
                const [modStr, keyStr, typeStr]:string[] = decodedMeta5.split(",");
                newSettings.set(i, {
                    charset: decodeBase64Unicode(meta[4]).replace(/\t\n/gu, ""),
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
                                        <button type="submit">
                                            <span>ユーザー取得</span>
                                        </button>
                                    </form>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        deobfuscateType ? 
                                        setDeobfuscateOutputs(deobfuscate(deobfuscateStrings, deobfuscateKey, deobfuscateCharset)) :
                                        setDeobfuscateOutputs(obfuscate(deobfuscateStrings, deobfuscateKey, deobfuscateCharset))
                                    }}>
                                        <label>
                                            難読化解除する文字列
                                            <input
                                                type="text"
                                                onChange={(e) => setDeobfuscateStrings(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        <label>
                                            Charset
                                            <input
                                                type="text"
                                                onChange={(e) => setDeobfuscateCharset(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        <label>
                                            難読化解除のキー
                                            <input
                                                type="number"
                                                onChange={(e) => setDeobfuscateKey(Number(e.target.value))}
                                                min={0}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        <label>
                                            難読化解除するかどうか
                                            <input
                                                type="checkbox"
                                                onChange={(e) => setDeobfuscateType(e.target.value === "true" ? 1 : 0)}
                                                checked={!!deobfuscateType}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        <button type="submit">
                                            <span>難読化解除</span>
                                        </button>
                                    </form>
                                    <p>結果: {deobfuscateOutputs}</p>
                                </div>
                                {!!userData ? (
                                    <>
                                        <p>結果:</p>
                                        {userData.map((data, index) => {
                                            const settings:userSettingsProps | undefined = userSettings.get(index);
                                            if (!settings) return null;
                                            return (
                                                <div key={index}>
                                                    <p>id: {data.id}</p>
                                                    <p>email: {decodeBase64Unicode(data.metadatas[0])}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[0]))}>
                                                            <span>emailをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>password: {decodeBase64Unicode(data.metadatas[1])}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[1]))}>
                                                            <span>passwordをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>birthday: {decodeBase64Unicode(data.metadatas[2])}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[2]))}>
                                                            <span>birthdayをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>username: {decodeBase64Unicode(data.metadatas[3])}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[3]))}>
                                                            <span>usernameをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>charset: {settings.charset}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[4]))}>
                                                            <span>charsetをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>MOD: {settings.mod}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[5]).split(",")[0])}>
                                                            <span>MODをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>key: {settings.key}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[5]).split(",")[1])}>
                                                            <span>keyをコピー</span>
                                                        </button>
                                                    </p>
                                                    <p>type: {settings.type}
                                                        <button onClick={async() => await copyToClipboard(decodeBase64Unicode(data.metadatas[5]).split(",")[2])}>
                                                            <span>typeをコピー</span>
                                                        </button>
                                                    </p>
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
import Head from 'next/head';
import styles from 'css/store.min.module.css';
import HeaderJp from '@/utils/pageParts/top/jp/Header';
import MenuJp from '@/utils/pageParts/top/jp/Menu';
import { useEffect, useState } from 'react';
import LeftMenuJp from '@/utils/pageParts/top/jp/LeftMenu';
import FooterJp from '@/utils/pageParts/top/jp/Footer';
import { supabaseServer } from '@/lib/supabaseClientServer';
import type { User } from '@supabase/supabase-js';
import { useUser } from '@supabase/auth-helpers-react';
import { DeveloperProps } from '@/pages/dashboard/developer/register';

export default function DeveloperConsoleModify() {
    const [loading, setLoading] = useState<boolean>(false);
    const [menuStatus, setMenuStatus] = useState<boolean>(false);
    const user:User | null = useUser();
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

    const devFetch = async() => {
        try{
            const { data, error } = await supabaseServer
                .from("store.developers")
                .select("developer_id,developer_name")
            if(error){
                console.error("Error: ", error.message);
                return;
            }
            return data;
        } catch(e){
            console.error("Error: ", e);
        }
    }

    const DevConsoleRegister = async(e:React.FormEvent) => {
        e.preventDefault();
        if(!document) return;
        setLoading(true);
        try{
            if(!user){
                alert("Error: 13ninアカウントが未登録です");
                throw new Error("Error: 13ninアカウントが未登録です");
            }
            const developerData:DeveloperProps[] | undefined = await devFetch();
            if(!developerData || developerData.length === 0){
                throw new Error("Error: developerData is undefined");
            }
            const developerid = (document.getElementById("developerid") as HTMLInputElement).value;
            const developerTopLevelDomain = (document.getElementById("developertopleveldomain") as HTMLSelectElement).value;
            const developersiteurl = (document.getElementById("developersiteurl") as HTMLInputElement).value;
            const developername = (document.getElementById("developername") as HTMLInputElement).value;
            for(let i = 0;i < developerData.length;i++){
                if(
                    user?.id === developerData[i].user_id ||
                    developerid === developerData[i].developer_id ||
                    developername === developerData[i].developer_name
                ){
                    alert("Error: このデベロッパはすでに存在しています");
                    throw new Error("Error: このデベロッパはすでに存在しています");
                } else {
                    continue;
                }
            }
            const { error } = await supabaseServer
                .from("store.developers")
                .update({
                    developer_id: `${developerTopLevelDomain}.${developerid}`,
                    developer_siteurl: developersiteurl,
                    developer_name: developername
                })
                .eq("user_id", user?.id)
                .select()
                .single();
            if(error){
                alert("エラー デベロッパ変更失敗");
                console.error("Error: ", error.message);
                return;
            }
            alert("13ninDeveloperConsole変更完了!");
            location.replace(`/store/developer/${developerid}`);
        } catch(e){
            console.error("Error: ", e);
        } finally {
            setLoading(false);
        }
    }
    return(
        <>
            <Head>
                <meta charSet='UTF-8' />
                <title>13ninデベロッパコンソール変更</title>
            </Head>
            <MenuJp handleClick={handleClick} menuStatus={menuStatus} />
            <div className={styles.contentsWrapper}>
                <HeaderJp handleClick={handleClick} />
                <div className={styles.contents}>
                    <LeftMenuJp URL="/dashboard/developer/modify" rupages='false' />
                    <main style={{ padding: '2rem', flex: 1 }}>
                        <>
                            <h1>13ninデベロッパコンソール変更</h1>
                            <form onSubmit={DevConsoleRegister}>
                                <label>
                                    デベロッパID
                                    <input type="text" id="developerid" required/>
                                </label>
                                <br/><br/>
                                <label>
                                    デベロッパトップレベルドメイン
                                    <select id="developertopleveldomain" required>
                                        <option value="com" selected>com</option>
                                        <option value="jp">jp</option>
                                        <option value="ru">ru</option>
                                        <option value="org">org</option>
                                        <option value="dev">dev</option>
                                        <option value="app">app</option>
                                    </select>
                                </label>
                                <br/><br/>
                                <label>
                                    デベロッパサイトURL
                                    <input type="text" id="developersiteurl"/>
                                </label>
                                <br/><br/>
                                <label>
                                    デベロッパ名
                                    <input type="text" id="developername" required/>
                                </label>
                                <br/><br/>
                                <button type="submit" disabled={loading}>
                                    <span>13ninデベロッパコンソール変更</span>
                                </button>
                            </form>
                        </>
                    </main>
                </div>
                <FooterJp/>
            </div>
        </>
    )
}

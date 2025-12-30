import Head from "next/head";
import { useEffect, useState } from "react";
import { supabaseServer } from "@/lib/supabaseClientServer";
import { notuseUsername } from "@/utils/user_list";
import {
    encrypt as secureEncrypt
} from "@/lib/secureObfuscator";
import { User } from "@supabase/auth-helpers-react";
import type { CountrieTypes, JenderTypes } from "@/pages/login/13nin/signup";
import { supabaseClient } from "@/lib/supabaseClient";

export default function AccountsSetup(){
    const [birthday, setBirthday] = useState<string>('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [jender, setJender] = useState<JenderTypes>('men');
    const [username, setUsername] = useState<string>('');
    const [shimei, setShimei] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isSetuped, setIsSetuped] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [userMeta, setUserMeta] = useState<any[]>([]);

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if(typeof window !== "undefined"){
            setLoading(true);
            setErrorMsg('');

            if (!!notuseUser_list_found) {
                setErrorMsg('このユーザー名は使用出来ません。');
                setLoading(false);
                return;
            }
            // メタデータ暗号化
            const updatedInputs:string[] | undefined = await secureEncrypt(
                user?.email!, "null", birthday, username, countries,
                jender, shimei
            );
            // 暗号化メタデータ送信
            try {
                const filtered = updatedInputs?.filter(i => i && i.trim() !== '');
                console.log("filtered: ", filtered);
                if (filtered!.length > 0) {
                    const session = await supabaseServer.auth.getSession();
                    const token = session?.data?.session?.access_token;
                    const res = await fetch('/api/accounts/users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ metadatas: filtered }),
                    });
                    const newItem = await res.json();
                    if(!res.ok){
                        console.error("Error: ", newItem);
                        return;
                    }
                    setUserMeta([...userMeta, newItem]);
                    window.location.replace('/dashboard');
                }
            } catch (e) {
                console.error("メタデータ送信エラー: ", e);
                setErrorMsg('メタデータの送信に失敗しました');
                setLoading(false);
                return;
            }
            setLoading(false);
        }
    };
    const UserFetched = async() => {
        try{
            console.log("user: ", user);
            if(!user) return;
            const { data, error } = await supabaseServer
                .from('user_metadatas')
                .select('metadatas')
                .eq('id', user?.id)
                .maybeSingle()
            console.log("metadatas: ", data?.metadatas);
            if(error){
                console.error("error: ", error);
                return;
            }
            if(data?.metadatas){
                setIsSetuped(true);
            }
        }catch(e){
            console.error("error: ", e);
        }
    }
    useEffect(() => {
        UserFetched();
    },[user]);
    useEffect(() => {
        if(typeof window !== "undefined"){
            if(user?.app_metadata.provider === "email" || isSetuped){
                window.location.replace("/dashboard");
            }
        }
    }, [user, isSetuped]);
    return (
        !!user ? (
            <>
                <Head>
                    <title>アカウントのセットアップ</title>
                </Head>
                <main style={{ padding: '2rem', maxWidth: 500 }}>
                    <form onSubmit={handleSignUp}>
                        <input 
                            type="text"
                            placeholder="氏名"
                            value={shimei}
                            onChange={e => setShimei(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                        <br /><br />
                        <label>
                            性別
                            <select
                                value={jender}
                                onChange={(e) =>
                                    setJender(e.target.value as JenderTypes)
                                }
                                required
                            >
                                <option selected value="men">男</option>
                                <option value="woman">女</option>
                            </select>
                        </label>
                        <br /><br />
                        <label>
                            生年月日
                            <input
                                type="date"
                                value={birthday}
                                onChange={e => setBirthday(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </label>
                        <br /><br />
                        <label>
                            国籍(通知・お知らせメールの言語に影響)
                            <select
                                value={countries}
                                onChange={(e) =>
                                    setCountries(e.target.value as CountrieTypes)
                                }
                                required
                            >
                                <option selected value="japan">日本 Japan</option>
                                <option value="russia">ロシア Русский</option>
                                <option value="others">その他 Others</option>
                            </select>
                        </label>
                        <input
                            type="text"
                            placeholder="ユーザー名"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                        <br /><br />
                        <label>
                            <a href="/policies">あさクラWiki利用規約</a>に同意
                            <input
                                type="checkbox"
                                required
                            />
                        </label>
                        <br /><br />
                        <label>
                            <a href="https://sakitibi-com9.webnode.jp/page/10">13nin利用規約</a>に同意
                            <input
                                type="checkbox" 
                                required
                            />
                        </label>
                        <br/><br/>
                        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                        <button type="submit" disabled={loading}>
                            <span>{loading ? '登録中…' : '新規登録'}</span>
                        </button>
                    </form>
                </main>
            </>
        ) : (
            <>
                <Head>
                    <title>403 Forbidden</title>
                </Head>
                <main style={{ padding: '2rem', maxWidth: 500 }}>
                    <h1>403 Forbidden</h1>
                    <p>アクセスする権限が有りません</p>
                </main>
            </>
        )
    )
}
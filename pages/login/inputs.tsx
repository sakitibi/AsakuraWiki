import Head from "next/head";
import { useEffect, useState } from "react";
import { notuseUsername } from "@/utils/user_list";
import {
    encrypt as secureEncrypt
} from "@/lib/secureObfuscator";
import { User } from "@supabase/auth-helpers-react";
import { getAge, type BirthDayProps, type CountrieTypes, type GenderTypes } from "@/pages/login/14nin/signup";
import { supabaseClient } from "@/lib/supabaseClient";
import { encodeBase64Unicode, gzipAndBase64 } from "@/lib/base64";
import upack from '@/node_modules/upack.js/src/index';
import { fetchAndSetUser } from '@/lib/authGetUser';

export default function AccountsSetup(){
    const [password, setPassword] = useState('');
    const [birthday, setBirthday] = useState<string>('');
    const [countries, setCountries] = useState<CountrieTypes>('japan');
    const [gender, setGender] = useState<GenderTypes>('man');
    const [username, setUsername] = useState<string>('');
    const [fullname, setFullname] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isSetuped, setIsSetuped] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [userMeta, setUserMeta] = useState<any[]>([]);

    const notuseUser_list_found = notuseUsername.find(value => username.match(value));
    const [user, setUser] = useState<User | null>(null);
    const [isEmail, setIsEmail] = useState<boolean>(false);

    useEffect(() => {
        // ユーザー情報を取得
        fetchAndSetUser(supabaseClient, setUser);
    }, []);
    useEffect(() => {
        if (!user) return;
        setIsEmail(user?.app_metadata.provider === "email");
    }, [user]);

    const handleSignUp = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if(typeof window !== "undefined"){
            setLoading(true);
            setErrorMsg('');

            if (!!notuseUser_list_found) {
                setErrorMsg('このユーザー名は使用出来ません。');
                setLoading(false);
                return;
            }

            const checkerBirthday: BirthDayProps = {
                year: parseInt(birthday.split("-")[0], 10),
                month: parseInt(birthday.split("-")[1], 10),
                date: parseInt(birthday.split("-")[2], 10)
            }
            // 登録時に子供かどうか判定
            const IsKids = getAge(checkerBirthday) < 18 ? gender === "woman" ? "girl" : "boy" : gender

            setTimeout(async () => {
                // メタデータ暗号化
                const updatedInputs:string[] | undefined = await secureEncrypt(
                    user?.email!, isEmail ? password : "null",
                    birthday, username, countries,
                    IsKids,
                    fullname
                );
                // 暗号化メタデータ送信
                try {
                    if (!updatedInputs) {
                        setErrorMsg("暗号化に失敗しました");
                        setLoading(false);
                        return;
                    }

                    const compressed = gzipAndBase64(JSON.stringify(updatedInputs));
                    if (updatedInputs) {
                        const session = await supabaseClient.auth.getSession();
                        const token = encodeBase64Unicode(await upack.SEncoder.encodeSEncode(
                            (new TextEncoder().encode(session?.data?.session?.access_token || "")).buffer,
                            process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!
                        ));
                        const res = await fetch('/api/accounts/users', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ metadatas: compressed }),
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
            }, 1000);
        }
    };
    const UserFetched = async() => {
        try{
            console.log("user: ", user);
            if(!user) return;
            const { data, error } = await supabaseClient
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
            if(isSetuped){
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
                            type="password"
                            placeholder={`パスワード${isEmail ? "(入力不用)" : ""}`}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={isEmail}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                        <br /><br />
                        <input 
                            type="text"
                            placeholder="氏名"
                            value={fullname}
                            onChange={e => setFullname(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                        <br /><br />
                        <label>
                            性別
                            <select
                                value={gender === "woman" || gender === "girl" ? "woman" : "man"}
                                onChange={(e) =>
                                    setGender(e.target.value as GenderTypes)
                                }
                                required
                            >
                                <option selected value="man">男</option>
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
                            <a href="https://sakitibi-com9.webnode.jp/page/10">14nin利用規約</a>に同意
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
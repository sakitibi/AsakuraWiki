import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabaseServer } from '@/lib/supabaseClientServer'; // ← realtime用クライアント
import { notuseUsername } from '@/utils/user_list';

export default function AmongusRoomAuthCode() {
    const [roomAuthCode, setRoomAuthcode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [inputRoomAuthcode, setInputRoomAuthcode] = useState<string>("");
    const [amongusUserName, setAmongusUserName] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const designColor: "default" = "default";

    // 初期表示
    useEffect(() => {
        if(typeof document !== "undefined"){
            document.body.classList.add('wiki-font');
            document.body.classList.add('default');
            return () => {
                document.body.classList.remove('wiki-font');
                document.body.classList.remove('default');
            };
        }
    }, [designColor]);

    // 初期値取得
    useEffect(() => {
        async function roomAuthCodeFetched() {
            try {
                const { data, error } = await supabaseServer
                    .from("wiki_variables")
                    .select("*")
                    .eq("id", "d4e4502a-6753-4b22-8289-9b19a4abc091")
                    .single();

                if (error) throw error;

                setRoomAuthcode(data?.value ?? "");
            } catch (e) {
                console.error("Error: ", e);
            }
        }
        roomAuthCodeFetched();
    }, []);

    // ★ Realtime 購読（更新が来たら自動反映）
    useEffect(() => {
        const channel = supabaseServer
            .channel("amongus_roomauthcode_realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "wiki_variables",
                    filter: "id=eq.d4e4502a-6753-4b22-8289-9b19a4abc091"
                },
                (payload) => {
                    const newRow = payload.new as { value?: string }; // ← 型を付ける

                    if (newRow.value !== undefined) {
                        setRoomAuthcode(newRow.value);
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseServer.removeChannel(channel);
        };
    }, []);
    
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        try{
            setLoading(true);
            const notuseUser_list_found = notuseUsername.find(value => amongusUserName.match(value));
            if(notuseUser_list_found){
                setErrorMsg("エラー 禁止されているユーザー名です。");
                return;
            }
            if(amongusUserName.length > 10){
                setErrorMsg("ユーザー名が長すぎます!");
                return;
            }
            if(roomAuthCode === inputRoomAuthcode){
                setErrorMsg("認証コードが正しくありません。");
                return;
            }
            const { error } = await supabaseServer
                .from("amongus_authcodes")
                .insert([{
                    authcode: inputRoomAuthcode ?? "SAKITIBI",
                    username: amongusUserName ?? "匿名(メンバーじゃない)"
                }])
            if(error){
                console.error("SubmitError: ", error.message);
                return;
            }
            setSuccess(true);
        } catch(e){
            console.error("SubmitError: ", e);
        } finally{
            setLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Amongus部屋認証コード</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            {success ? (
                                <>
                                    <h1>認証が完了しました!</h1>
                                    <p><a href="amongus:">Amongus部屋にお戻り下さい</a></p>
                                    <p><a href="https://sakitibi.github.io/13nin.com/Amongusの13人TV部屋のルール">Amongusの13人TV部屋のルール</a></p>
                                    <p><a href="/policies">利用規約</a></p>
                                </>
                            ) : (
                                <>
                                    <h1>
                                        <i
                                            className="fa-jelly-fill fa-regular fa-lock"
                                            style={{ fontSize: "inherit" }}
                                        ></i>
                                        Amongus部屋認証コード
                                    </h1>
                                    <p>2026年1月31日より、認証コードの入力がルール上必須となりました。</p>
                                    <p>認証コードを入力しないとルールに同意していないと判断されます。</p>
                                    <p>以下をフォームに入力して下さい。</p>
                                    <p style={{fontSize: "15px" }}>認証コード: <strong>{roomAuthCode}</strong></p>
                                    <form onSubmit={handleSubmit}>
                                        <label>
                                            認証コード
                                            <input
                                                type='text'
                                                onChange={(e) => setInputRoomAuthcode(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        <label>
                                            Amongusでのユーザー名(10文字以内)
                                            <input
                                                type='text'
                                                onChange={(e) => setAmongusUserName(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br/><br/>
                                        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                                        <button type='submit'>
                                            <span>{loading ? "認証中" : "認証"}</span>
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}

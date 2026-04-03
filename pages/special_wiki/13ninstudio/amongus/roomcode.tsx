import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { supabaseServer } from '@/lib/supabaseClientServer'; // ← realtime用クライアント

export default function AmongusRoomCode() {
    const [roomcode, setRoomcode] = useState<string>("");

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
        async function roomCodeFetched() {
            try {
                const { data, error } = await supabaseServer
                    .from("wiki_variables")
                    .select("*")
                    .eq("id", "640a4587-5be7-4727-aee6-e9493050f022")
                    .single();

                if (error) throw error;

                setRoomcode(data?.value ?? "");
            } catch (e) {
                console.error("Error: ", e);
            }
        }
        roomCodeFetched();
    }, []);

    // ★ Realtime 購読（更新が来たら自動反映）
    useEffect(() => {
        const channel = supabaseServer
            .channel("amongus_roomcode_realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "wiki_variables",
                    filter: "id=eq.640a4587-5be7-4727-aee6-e9493050f022"
                },
                (payload) => {
                    const newRow = payload.new as { value?: string }; // ← 型を付ける

                    if (newRow.value !== undefined) {
                        setRoomcode(newRow.value);
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseServer.removeChannel(channel);
        };
    }, []);

    return (
        <>
            <Head>
                <title>Amongus部屋コード募集</title>
            </Head>
            <div id="contents-wrapper" style={{display: 'flex'}}>
                <div id="container" style={{display: 'flex'}}>
                    <article style={{ padding: '2rem', maxWidth: 800 }} className='columnCenter'>
                        <div id="body">
                            <h1>Amongus部屋コード募集</h1>
                            <p>サーバー: アジア</p>
                            <p>言語: 日本語</p>
                            <p>チャット: フリーチャット</p>
                            <p>現在はこれ! {!!roomcode ? (
                                <p>{roomcode}</p>
                            ) : (
                                <p>現在はありません</p>
                            )}</p>
                        </div>
                        <br/>
                        <div id="ad-container" style={{ textAlign: 'center' }}>
                            <iframe src="https://sakitibi.github.io/13ninadmanager.com/main-contents-buttom" width="700" height="350"></iframe>
                        </div>
                    </article>
                    <Script src='https://sakitibi.github.io/13ninadmanager.com/js/13nin_vignette.js' />
                </div>
            </div>
        </>
    );
}

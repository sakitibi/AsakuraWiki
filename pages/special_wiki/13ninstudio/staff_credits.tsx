import { supabaseClient } from "@/lib/supabaseClient";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Redirecting() {
    const [loading, setLoading] = useState(true);

    const handleRedirect = async () => {
        // 1. ボット判定
        const ua = navigator.userAgent;
        const isBot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

        if (isBot) {
            location.replace("https://sakitibi.github.io/13nin.com/staff_credits");
            return;
        }

        // 2. ユーザー取得を待機
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        // 1秒待機を入れる場合（必要なければ削除可）
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (user) {
            const { data } = await supabaseClient.auth.getSession();
            const token = data.session?.access_token;
            location.replace(`https://sakitibi.github.io/13nin.com/staff_credits?login=${token}`);
        } else {
            location.replace("/login");
        }
        setLoading(false);
    };

    useEffect(() => {
        handleRedirect();
    }, []);

    return (
        <>
            <Head>
                <title>Redirecting..</title>
            </Head>
            <div>
                {loading ? "読み込み中..." : "リダイレクト中..."}
                <button onClick={handleRedirect}><span>リダイレクト</span></button>
            </div>
        </>
    );
}
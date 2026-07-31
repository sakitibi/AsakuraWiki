import { supabaseClient } from "@/lib/supabaseClient";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Redirecting() {
    const [loading, setLoading] = useState(true);

    const handleRedirect = async () => {
        console.log("1. handleRedirect 開始");

        try {
            // ボット判定
            const ua = navigator.userAgent;
            const isBot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

            if (isBot) {
                console.log("2-Bot. ボットと判定されました");
                window.location.href = "https://sakitibi.github.io/14nin.com/staff_credits";
                return;
            }

            console.log("2. ユーザー認証の取得を開始します");

            const fetchUserPromise = supabaseClient.auth.getUser();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Supabase auth timeout")), 3000)
            );

            // タイムアウトと並行で実行
            const { data: userData } = (await Promise.race([
                fetchUserPromise,
                timeoutPromise,
            ])) as any;

            const user = userData?.user;
            console.log("3. ユーザー判定結果:", user ? "ログイン済み" : "未ログイン");

            const url = new URL(window.location.href);
            const id = url.searchParams.get("id");

            if (user) {
                console.log("4-A. セッションを取得中...");
                const { data } = await supabaseClient.auth.getSession();
                const token = data.session?.access_token;

                const targetUrl = `https://sakitibi.github.io/14nin.com/staff_credits?login=${token}${
                    id ? `&id=${id}` : ""
                }`;

                console.log("5-A. リダイレクト実行:", targetUrl);
                window.location.href = targetUrl;
            } else {
                console.log("4-B. 未ログインのため /login へ遷移します");
                window.location.href = "/login";
            }
        } catch (e) {
            console.error("リダイレクト処理エラー（安全のため/loginへ送ります）:", e);
            window.location.href = "/login";
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // SSR（サーバー側）での実行を回避
        if (typeof window === "undefined") return;
        handleRedirect();
    }, []);

    return (
        <>
            <Head>
                <title>Redirecting..</title>
            </Head>
            <div>
                {loading ? "読み込み中..." : "リダイレクト中..."}
                <button onClick={handleRedirect}>
                    <span>手動でリダイレクト</span>
                </button>
            </div>
        </>
    );
}
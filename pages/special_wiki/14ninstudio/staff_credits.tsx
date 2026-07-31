import { supabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Redirecting() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const handleRedirect = async () => {
        try{
            // 1. ボット判定
            const ua = navigator.userAgent;
            const isBot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

            if (isBot) {
                location.replace("https://sakitibi.github.io/14nin.com/staff_credits");
                return;
            }
            supabaseClient.auth.getUser().then(({ data }) => {
                if (data.user) {
                    setUser(data.user);
                }
            });

            const url = new URL(location.href);
            const id = url.searchParams.get("id");

            await new Promise(() => setTimeout(() => {}, 1000));

            if (user) {
                const { data } = await supabaseClient.auth.getSession();
                const token = data.session?.access_token;
                location.replace(
                    `https://sakitibi.github.io/14nin.com/staff_credits?login=${token}${id ? `&id=${id}` : ""}`
                );
            } else {
                location.replace("/login");
            }
        } catch(e) {
            console.error("Redirect Error: ", e);
        } finally {
            setLoading(false);
        }
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
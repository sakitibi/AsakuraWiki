import { supabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Redirecting(){
    const [user, setUser] = useState<User | null>(null);
    const [isBot, setIsBot] = useState<boolean | null>(null);
    useEffect(() => {
        const ua = navigator.userAgent;
        const bot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);
        setIsBot(bot);
    }, []);
    useEffect(() => {
        supabaseClient.auth.getUser().then(({ data, error }) => {
            console.log('[getUser]', { data, error });

            if (data.user) {
                setUser(data.user);
            }
        });
    }, []);
    const Redirect = async () => {
        if (isBot === true) {
            location.replace("https://sakitibi.github.io/13nin.com/staff_credits");
        } else {
            if (user) {
                const session = await supabaseClient.auth.getSession();
                const token = session?.data?.session?.access_token
                if(typeof location !== "undefined" && typeof window !== "undefined"){
                    location.replace(`https://sakitibi.github.io/13nin.com/staff_credits?login=${token}`);
                }
            } else {
                location.replace("/login");
            }
        }
    }
    useEffect(() => {
        if (isBot === null) return;
        Redirect();
    }, [isBot]);
    return(
        <>
            <Head>
                <title>Redirecting..</title>
            </Head>
            <button onClick={Redirect}><span>リダイレクト</span></button>
        </>
    )
}
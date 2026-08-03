import { supabaseClient } from "@/lib/supabaseClient";
import { GetServerSideProps } from "next";

export default function Redirecting() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, query } = context;
    const ua = req.headers["user-agent"] || "";

    // 1. ボット判定
    const isBot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider)/i.test(ua);

    if (isBot) {
        return {
            redirect: {
                destination: "https://sakitibi.github.io/14nin.com/staff_credits",
                permanent: false,
            },
        };
    }

    try {
        const fetchUserPromise = supabaseClient.auth.getUser();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Supabase auth timeout")), 3000)
        );

        const { data: userData } = (await Promise.race([
            fetchUserPromise,
            timeoutPromise,
        ])) as any;

        const user = userData?.user;
        const id = query.id as string | undefined;

        if (user) {
            const { data } = await supabaseClient.auth.getSession();
            const rawToken = data.session?.access_token;
            const token = rawToken ? encodeURIComponent(rawToken) : "";

            const targetUrl = `https://sakitibi.github.io/14nin.com/staff_credits?login=${token}${
                id ? `&id=${encodeURIComponent(id)}` : ""
            }`;

            return {
                redirect: {
                    destination: targetUrl,
                    permanent: false,
                },
            };
        } else {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }
    } catch (e) {
        console.error("SSRリダイレクト処理エラー:", e);
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }
};
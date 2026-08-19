import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { GetServerSideProps } from "next";

export default function Redirecting() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req, res, query } = context;
    const ua = req.headers["user-agent"] || "";

    // ボット判定
    const isBot = /(Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider|facebook\.com|HeadlessChrome)/i.test(ua);

    if (isBot) {
        return {
            redirect: {
                destination: "https://sakitibi.github.io/14nin.com/staff_credits",
                permanent: false,
            },
        };
    }

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return Object.keys(req.cookies).map((name) => ({
                            name,
                            value: req.cookies[name] || "",
                        }));
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            res.appendHeader(
                                "Set-Cookie",
                                serializeCookieHeader(name, value, options)
                            );
                        });
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        const id = query.id as string | undefined;

        if (user) {
            const { data: { session } } = await supabase.auth.getSession();
            const rawToken = session?.access_token;
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
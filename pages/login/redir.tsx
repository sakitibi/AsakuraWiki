import { GetServerSideProps } from 'next';
import { createServerClient, serializeCookieHeader } from '@supabase/ssr';

export default function Redirecting() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return Object.entries(req.cookies).map(([name, value]) => ({
                        name,
                        value: value ?? '',
                    }));
                },
                setAll(cookies) {
                    cookies.forEach(({ name, value, options }) => {
                        const cookieStr = serializeCookieHeader(name, value, options);
                        
                        // 既存の Set-Cookie ヘッダーを取得
                        const currentCookies = res.getHeader('Set-Cookie');
                        
                        if (!currentCookies) {
                            res.setHeader('Set-Cookie', [cookieStr]);
                        } else if (Array.isArray(currentCookies)) {
                            res.setHeader('Set-Cookie', [...currentCookies, cookieStr]);
                        } else {
                            res.setHeader('Set-Cookie', [currentCookies as string, cookieStr]);
                        }
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            redirect: {
                destination: "https://sakitibi.github.io/selects/e38182e38195e382afe383a957696b69e383ade382b0e382a4e383b3",
                statusCode: 307,
                permanent: false,
            }
        };
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard`;

    return {
        redirect: {
            destination: dashboardUrl,
            statusCode: 307,
            permanent: false
        }
    };
};
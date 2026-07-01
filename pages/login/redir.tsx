import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';

export default function Redirecting() {
    // サーバー側でリダイレクトされるため、基本的にはこのコンポーネントはレンダリングされません。
    // 万が一のフォールバックとしてのみ機能します。
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
                    res.setHeader(
                        'Set-Cookie',
                        cookies.map(({ name, value, options }) =>
                            `${name}=${value}; Path=/; ${
                                options?.maxAge ? `Max-Age=${options.maxAge};` : ''
                            } ${
                                options?.httpOnly ? 'HttpOnly;' : ''
                            } ${
                                options?.secure ? 'Secure;' : ''
                            } ${
                                options?.sameSite ? `SameSite=${options.sameSite};` : ''
                            }`
                        )
                    );
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

    return {
        redirect: {
            destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard`,
            statusCode: 307,
            permanent: false
        }
    };
};

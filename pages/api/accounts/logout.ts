import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies[name];
                },
                set(name: string, value: string, options: any) {
                    res.setHeader(
                        'Set-Cookie',
                        serialize(name, value, {
                            ...options,
                            path: '/',
                        })
                    );
                },
                remove(name: string, options: any) {
                    res.setHeader(
                        'Set-Cookie',
                        serialize(name, '', {
                            ...options,
                            path: '/',
                            maxAge: 0,
                        })
                    );
                },
            },
        }
    );

    await supabase.auth.signOut();
    res.status(200).json({ ok: true });
}

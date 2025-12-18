import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

const ALLOWED_ORIGINS = [
    'https://asakura-wiki.vercel.app',
    'https://sakitibi.github.io',
]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const origin = req.headers.origin

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    } else if (req.method === 'POST') {
        // else必須
        // ✅ 新仕様（非 deprecated）
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return Object.entries(req.cookies)
                        .filter((entry): entry is [string, string] =>
                            typeof entry[1] === 'string'
                        )
                        .map(([name, value]) => ({
                            name,
                            value,
                        }))
                    },

                    setAll(cookies: { name: string; value: string }[]) {
                        res.setHeader(
                            'Set-Cookie',
                            cookies.map(
                                ({ name, value }) =>
                                `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=None`
                            )
                        )
                    },
                },
            }
        )
        // 🔑 セッション取得
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (!user || userError) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { email, password } = req.body as {
            email?: string
            password?: string
        }

        const updateAuth: {
            email?: string
            password?: string
        } = {}

        if (email?.trim()) updateAuth.email = email
        if (password?.trim()) updateAuth.password = password

        if (Object.keys(updateAuth).length === 0) {
            return res.status(200).json({ ok: true })
        }

        const { error } = await supabase.auth.updateUser(updateAuth)

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        return res.status(200).json({ ok: true })
    } else {
        res.setHeader('Allow', ['POST', 'OPTIONS'])
        return res.status(405).end()
    }
}

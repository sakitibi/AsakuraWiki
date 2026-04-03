import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ← 必須
)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { userId, email, password } = req.body as {
        userId?: string
        email?: string
        password?: string
    }

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' })
    }

    if (!email && !password) {
        return res.status(400).json({ error: 'Nothing to update' })
    }

    const { error } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            ...(email ? { email } : {}),
            ...(password ? { password } : {}),
        })

    if (error) {
        console.error('[update-auth]', error)
        return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ ok: true })
}

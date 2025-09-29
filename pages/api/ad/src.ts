import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        if (req.method === 'GET') {
            return res.status(200).json(
                {
                    "src": [
                        "S7O5-dFA420",
                        "3lR7twYgDyU",
                        "uco7lnMyE60",
                        "tDSKIli-89E",
                        "6swStVmu9Is",
                        "6TMwllJkCDo",
                        "EYeJk0AQ3J0",
                        "v0xckWVpW2U",
                        "7eJTeiG83Uo",
                        "GS0uYMSRXxc",
                        "zk_-tCv7bzE",
                        "e-mqoayfaWk",
                        "MayOi2iFd6U"
                    ]
                }
            )
        }
        // ======================
        // 許可されていないメソッド
        // ======================
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: 'Method not allowed' })
    } catch (e:any) {
        console.error('API exception:', e)
        return res.status(500).json({ error: e.message || 'Internal server error' })
    }
}

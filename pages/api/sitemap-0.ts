import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sitemap-0.xml`);
        
        if (!response.ok) {
            return res.status(response.status).send('Failed to fetch sitemap');
        }

        const data = await response.text();

        const currentIsoDate = new Date().toISOString();

        const replaced = data.replace(/(<lastmod>).*?(<\/lastmod>)/g, `$1${currentIsoDate}$2`);

        // クライアントにレスポンスを返す
        return res.status(200).send(replaced);

    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
}
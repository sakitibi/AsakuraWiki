import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "@gradio/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // POSTメソッド以外は弾く
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { text } = req.body as { text?: string };

        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const spaceId = process.env.HF_SPACE_ID;
        if (!spaceId) {
            throw new Error('HF_SPACE_ID is not defined in environment variables.');
        }
        const app = await Client.connect(spaceId);

        const result = await app.predict("/predict", [text]) as { data: string[] };

        const aiAnswer = result.data[0].trim();
        
        const isAdvocated = aiAnswer.toLowerCase() === 'yes';

        // フロントエンドに結果を返却
        return res.status(200).json({ isAdvocated: isAdvocated });

    } catch (error) {
        console.error('Next.js API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
    }
}
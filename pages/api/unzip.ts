import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';

// レスポンスの型定義
interface ExtractedFile {
    filename: string;
    size: number;
    content: string;
};

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    if (req.method !== 'POST') return res.status(405).end();

    const { zipFilePath, password } = req.body;

    if (!zipFilePath || !password) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try {
        // 1. ファイル読み込み
        const responce = await fetch(zipFilePath);
        const fileBuffer = await responce.arrayBuffer();
        const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(fileBuffer)));
        const entries = await reader.getEntries();

        const results: ExtractedFile[] = [];

        for (const entry of entries) {
            // 画像ファイルのみを抽出対象とする
            if (!entry.directory && entry.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                
                // 2. 解凍 (Uint8Arrayとして取得)
                const data = await entry.getData!(new zip.Uint8ArrayWriter(), {
                    password,
                    checkSignature: true
                });

                // 3. Uint8Array を Base64 文字列に変換
                const base64Content = Buffer.from(data).toString('base64');

                results.push({
                    filename: entry.filename,
                    size: data.length,
                    content: base64Content
                });
            }
        }

        await reader.close();

        // 4. 指定された形式で返却
        return res.status(200).json(results);

    } catch (error: any) {
        console.error('Unzip Error:', error);
        return res.status(500).json({ 
            message: '解凍に失敗しました', 
            error: error.message 
        });
    }
}
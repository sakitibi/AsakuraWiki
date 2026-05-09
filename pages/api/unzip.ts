import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';

interface ExtractedFile {
    filename: string;
    size: number;
    content: string;
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    if (req.method === "GET") {
        const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
        const password = Array.isArray(req.query.password) ? req.query.password[0] : req.query.password;

        if (!url || !password) {
            return res.status(400).json({ message: 'URLとパスワードを指定してください (?url=...&password=...)' });
        }

        try {
            // 1. 外部URLからZIPを取得
            const response = await fetch(url);
            if (!response.ok) throw new Error(`ZIPファイルの取得に失敗しました: ${response.status}`);
            
            const fileBuffer = await response.arrayBuffer();
            const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(fileBuffer)));
            const entries = await reader.getEntries();

            const results: ExtractedFile[] = [];

            for (const entry of entries) {
                if (!entry.directory && entry.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    
                    // 2. 解凍処理
                    const data = await entry.getData!(new zip.Uint8ArrayWriter(), {
                        password,
                        checkSignature: true
                    });

                    // 3. Base64変換
                    const base64Content = Buffer.from(data).toString('base64');

                    results.push({
                        filename: entry.filename,
                        size: data.length,
                        content: base64Content
                    });
                }
            }

            await reader.close();
            return res.status(200).json(results);

        } catch (error: any) {
            console.error('Unzip Error:', error);
            
            // パスワード間違いや、ファイルが存在しない場合などのエラーハンドリング
            const status = error.message.includes('password') ? 401 : 500;
            return res.status(status).json({ 
                message: '解凍に失敗しました', 
                error: error.message 
            });
        }
    }
    
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
}
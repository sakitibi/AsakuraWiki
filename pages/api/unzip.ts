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
        // 1. クエリパラメータの正規化
        const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
        const password = Array.isArray(req.query.password) ? req.query.password[0] : req.query.password;
        
        const sliceStart = parseInt(Array.isArray(req.query.slice_start) ? req.query.slice_start[0] : (req.query.slice_start || '0'));
        const sliceEndParam = Array.isArray(req.query.slice_end) ? req.query.slice_end[0] : req.query.slice_end;
        const sliceEnd = sliceEndParam ? parseInt(sliceEndParam) : undefined;

        if (!url || !password) {
            return res.status(400).json({ message: 'URLとパスワードを指定してください (?url=...&password=...)' });
        }

        try {
            // 2. リモートZIPの取得
            const response = await fetch(url);
            if (!response.ok) throw new Error(`ZIP取得失敗: ${response.status} ${response.statusText}`);
            
            const fileBuffer = await response.arrayBuffer();
            const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(fileBuffer)));
            
            // 3. エントリ取得とフィルタリング（ここで型を確定させる）
            const allEntries = await reader.getEntries();
            
            const imageEntries = allEntries.filter((entry): entry is zip.Entry & { getData: Function } => 
                !entry.directory && 
                !!entry.getData && 
                /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.filename)
            );

            // 4. 指定範囲のみ切り出し
            const targetedEntries = imageEntries.slice(sliceStart, sliceEnd);

            const results: ExtractedFile[] = [];

            // 5. 解凍処理（必要な分だけ実行）
            for (const entry of targetedEntries) {
                // entry.getData は型ガードにより確実に存在
                const data = await entry.getData!(new zip.Uint8ArrayWriter(), {
                    password,
                    checkSignature: true
                });

                results.push({
                    filename: entry.filename,
                    size: data.length,
                    content: Buffer.from(data).toString('base64')
                });
            }

            await reader.close();

            // メタ情報をヘッダーに付与
            res.setHeader('X-Total-Count', imageEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? imageEntries.length).toString());

            return res.status(200).json(results);

        } catch (error: any) {
            console.error('Unzip Error:', error);
            
            // パスワード間違い（Signature不一致）などのエラー判定
            const isPasswordError = error.message?.toLowerCase().includes('password') || error.message?.includes('signature');
            
            return res.status(isPasswordError ? 401 : 500).json({ 
                message: isPasswordError ? 'パスワードが正しくありません' : '解凍に失敗しました', 
                error: error.message 
            });
        }
    }

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
}
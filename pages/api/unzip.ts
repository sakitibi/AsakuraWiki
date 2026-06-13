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

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "GET") {
        const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;
        // パスワードが未指定（undefined）でも許容する
        const password = Array.isArray(req.query.password) ? req.query.password[0] : req.query.password;
        
        const sliceStart = parseInt(Array.isArray(req.query.slice_start) ? req.query.slice_start[0] : (req.query.slice_start || '0'));
        const sliceEndParam = Array.isArray(req.query.slice_end) ? req.query.slice_end[0] : req.query.slice_end;
        const sliceEnd = sliceEndParam ? parseInt(sliceEndParam) : undefined;

        if (!url) {
            return res.status(400).json({ message: 'URLを指定してください (?url=...)' });
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`ZIP取得失敗: ${response.status} ${response.statusText}`);
            
            const fileBuffer = await response.arrayBuffer();
            const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(fileBuffer)));
            
            const allEntries = await reader.getEntries();
            
            const validEntries = allEntries.filter((entry): entry is zip.Entry & { getData: Function } => 
                !entry.directory && 
                !!entry.getData &&
                !entry.filename.includes('__MACOSX') // システムゴミファイルは除外
            );

            const targetedEntries = validEntries.slice(sliceStart, sliceEnd);
            const results: ExtractedFile[] = [];

            for (const entry of targetedEntries) {
                // パスワードがある場合のみオプションオブジェクトを構築
                const options: zip.EntryGetDataOptions = {
                    checkSignature: true
                };
                if (password) {
                    options.password = password;
                }

                const data = await entry.getData!(new zip.Uint8ArrayWriter(), options);

                results.push({
                    filename: entry.filename,
                    size: data.length,
                    content: Buffer.from(data).toString('base64')
                });
            }

            await reader.close();

            res.setHeader('X-Total-Count', validEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());

            return res.status(200).json(results);

        } catch (error: any) {
            console.error('Unzip Error:', error);
            
            // パスワード関連エラーの判定
            const errorMsg = error.message?.toLowerCase() || "";
            const isPasswordError = errorMsg.includes('password') || errorMsg.includes('signature') || errorMsg.includes('encrypted');
            
            return res.status(isPasswordError ? 401 : 500).json({ 
                message: isPasswordError ? 'パスワードが正しくないか、暗号化されています' : '解凍に失敗しました', 
                error: error.message 
            });
        }
    }
}
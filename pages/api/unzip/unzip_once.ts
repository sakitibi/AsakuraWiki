import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';

interface ExtractedFileMeta {
    filename: string;
    size: number;
    index: number;
}

export const config = {
    api: {
        responseLimit: false,
    },
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        const body = req.body;
        const index = Array.isArray(body.index) ? body.index[0] : body.index;
        const url = Array.isArray(body.url) ? body.url[0] : body.url;
        // パスワードが未指定（undefined）でも許容する
        const password = Array.isArray(body.password) ? body.password[0] : body.password;
        
        const sliceStart = parseInt(Array.isArray(body.slice_start) ? body.slice_start[0] : (body.slice_start || '0'));
        const sliceEndParam = Array.isArray(body.slice_end) ? body.slice_end[0] : body.slice_end;
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
            const results: ExtractedFileMeta[] = [];
            const buffers: ArrayBuffer[] = []

            for (let i = 0;i < targetedEntries.length;i++) {
                // パスワードがある場合のみオプションオブジェクトを構築
                const options: zip.EntryGetDataOptions = {
                    checkSignature: true
                };
                if (password) {
                    options.password = password;
                }

                const data = await targetedEntries[i].getData!(new zip.Uint8ArrayWriter(), options);

                results.push({
                    filename: targetedEntries[i].filename,
                    size: data.length,
                    index: i
                });
                buffers.push(data);
            }

            await reader.close();
            
            res.setHeader('Content-Type', 'application/octet-stream; charset=utf-8');
            res.setHeader('X-Total-Count', validEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());
            res.setHeader('X-Results', Buffer.from(JSON.stringify(results), "utf8").toString("base64"));
            const targetBuffer = buffers[parseInt(index || "0", 10)];
            if (!targetBuffer) {
                return res.status(400).json({ message: '指定された index のデータが存在しません' });
            }

            return res.status(200).send(Buffer.from(targetBuffer));
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
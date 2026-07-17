import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';

zip.configure({
    useWebWorkers: false,
});

interface ExtractedFileMeta {
    filename: string;
    size: number;
    index: number;
}

export const config = {
    api: {
        responseLimit: false,
    },
};

// 拡張子から MIME Type を判定するヘルパー関数
function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
        // 画像フォーマット
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'gif':
            return 'image/gif';
        case 'webp':
            return 'image/webp';
        case 'svg':
            return 'image/svg+xml';
        case 'bmp':
            return 'image/bmp';
        case 'ico':
            return 'image/x-icon';
        case 'avif':
            return 'image/avif';
        // その他汎用テキスト・データ
        case 'json':
            return 'application/json';
        case 'txt':
            return 'text/plain; charset=utf-8';
        case 'pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
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
        const body = req.body || {};
        const targetIndex = parseInt(Array.isArray(body.index) ? body.index[0] : (body.index || '0'), 10);
        const url = Array.isArray(body.url) ? body.url[0] : body.url;
        const password = Array.isArray(body.password) ? body.password[0] : body.password;
        
        const sliceStart = parseInt(Array.isArray(body.slice_start) ? body.slice_start[0] : (body.slice_start || '0'), 10);
        const sliceEndParam = Array.isArray(body.slice_end) ? body.slice_end[0] : body.slice_end;
        const sliceEnd = sliceEndParam ? parseInt(sliceEndParam, 10) : undefined;

        if (!url) {
            return res.status(400).json({ message: 'URLを指定してください' });
        }

        try {
            const reader = new zip.ZipReader(new zip.HttpReader(url));
            const allEntries = await reader.getEntries();
            
            const validEntries = allEntries.filter((entry): entry is zip.Entry & { getData: Function } => 
                !entry.directory && 
                !!entry.getData &&
                !entry.filename.includes('__MACOSX')
            );

            const targetedEntries = validEntries.slice(sliceStart, sliceEnd);

            if (targetIndex < 0 || targetIndex >= targetedEntries.length) {
                await reader.close();
                return res.status(400).json({ message: '指定された index のデータが存在しません' });
            }

            // メタデータ一覧の作成
            const results: ExtractedFileMeta[] = targetedEntries.map((entry, i) => ({
                filename: entry.filename,
                size: entry.uncompressedSize,
                index: i
            }));

            // 指定された特定の1ファイルのみを解凍
            const targetEntry = targetedEntries[targetIndex];
            const options: zip.EntryGetDataOptions = { checkSignature: true };
            if (password) {
                options.password = password;
            }

            const data = await targetEntry.getData!(new zip.Uint8ArrayWriter(), options);
            await reader.close();

            // 対象ファイルの拡張子から MIME Type を動的に決定
            const contentType = getMimeType(targetEntry.filename);

            res.setHeader('Content-Type', contentType);
            res.setHeader('X-Total-Count', validEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());
            res.setHeader('X-Results', Buffer.from(JSON.stringify(results), "utf8").toString("base64"));

            return res.status(200).send(Buffer.from(data));

        } catch (error: any) {
            console.error('Unzip Single Error:', error);
            
            const errorMsg = error.message?.toLowerCase() || "";
            const isPasswordError = errorMsg.includes('password') || errorMsg.includes('signature') || errorMsg.includes('encrypted');
            
            return res.status(isPasswordError ? 401 : 500).json({ 
                message: isPasswordError ? 'パスワードが正しくないか、暗号化されています' : '解凍に失敗しました', 
                error: error.message 
            });
        }
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
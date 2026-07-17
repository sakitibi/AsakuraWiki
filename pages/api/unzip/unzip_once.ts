import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as any;
}

zip.configure({
    useWebWorkers: false,
});

export const config = {
    api: {
        responseLimit: false,
    },
    maxDuration: 60,
};

function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'svg': return 'image/svg+xml';
        case 'bmp': return 'image/bmp';
        case 'ico': return 'image/x-icon';
        case 'avif': return 'image/avif';
        case 'json': return 'application/json';
        case 'txt': return 'text/plain; charset=utf-8';
        case 'pdf': return 'application/pdf';
        default: return 'application/octet-stream';
    }
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Slice-Start, X-Slice-End, X-Results');

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } 
    
    if (req.method !== "POST") {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
    }
    body = body || {};

    const targetIndex = parseInt(Array.isArray(body.index) ? body.index[0] : (body.index || '0'), 10);
    const url = Array.isArray(body.url) ? body.url[0] : body.url;
    const password = Array.isArray(body.password) ? body.password[0] : body.password;
    
    const sliceStart = parseInt(Array.isArray(body.slice_start) ? body.slice_start[0] : (body.slice_start || '0'), 10);
    const sliceEndParam = Array.isArray(body.slice_end) ? body.slice_end[0] : body.slice_end;
    const sliceEnd = sliceEndParam ? parseInt(sliceEndParam, 10) : undefined;

    if (!url) {
        return res.status(400).json({ message: 'URLを指定してください' });
    }

    let reader: zip.ZipReader<any> | null = null;

    try {
        reader = new zip.ZipReader(new zip.HttpReader(url));
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

        const targetEntry = targetedEntries[targetIndex];
        console.log(`[Unzip Single Extracting] File: ${targetEntry.filename} (${targetEntry.uncompressedSize} bytes)`);

        const options: zip.EntryGetDataOptions = { checkSignature: false };
        if (password) {
            options.password = password;
        }

        // --- 1. ヘッダーを先に書き出す ---
        const contentType = getMimeType(targetEntry.filename);
        res.setHeader('Content-Type', contentType);
        res.setHeader('X-Total-Count', validEntries.length.toString());
        res.setHeader('X-Slice-Start', sliceStart.toString());
        res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());

        // --- 2. TransformStream を作成して Node.js の レスポンス(res) へ流し込む ---
        const transformStream = new TransformStream();
        const writer = transformStream.writable;
        const readerStream = transformStream.readable;

        // 解凍処理をバックグラウンドで開始（Chunk ごとに writer へ流れる）
        const extractPromise = targetEntry.getData!(writer, options)
            .finally(async () => {
                if (reader) await reader.close().catch(() => {});
            });

        const streamReader = readerStream.getReader();
        while (true) {
            const { done, value } = await streamReader.read();
            if (done) break;
            res.write(Buffer.from(value)); // Chunk ごとに書き出し
        }

        await extractPromise; // 解凍完了を待つ
        res.end(); // レスポンス終了

    } catch (error: any) {
        if (reader) await reader.close().catch(() => {});

        console.error('=== [Unzip Single Error Detail] ===');
        console.error('Error Message:', error?.message || String(error));
        
        // すでにヘッダー送信済みの場合は JSON エラーを返せないためソケットを閉じる
        if (res.headersSent) {
            return res.destroy();
        }

        const errorMsg = (error?.message || "").toLowerCase();
        const isPasswordError = 
            errorMsg.includes('password') || 
            errorMsg.includes('signature') || 
            errorMsg.includes('encrypted') ||
            errorMsg.includes('decrypt') ||
            errorMsg.includes('pbkdf2') ||
            errorMsg.includes('aes');

        return res.status(isPasswordError ? 401 : 500).json({ 
            message: isPasswordError ? 'パスワードが正しくないか暗号化エラーです' : '解凍に失敗しました', 
            error: error?.message || String(error)
        });
    }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';
import { webcrypto } from 'node:crypto';
import { PassThrough, Writable } from 'node:stream';

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

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    const url = Array.isArray(body.url) ? body.url[0] : body.url;
    const password = Array.isArray(body.password) ? body.password[0] : body.password;

    if (!url) {
        return res.status(400).json({ message: 'URLを指定してください' });
    }

    let zipReader: zip.ZipReader<any> | null = null;

    try {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="unlocked.zip"');

        // Node.js の PassThrough ストリームを作成し、レスポンスへパイプ接続
        const passThroughStream = new PassThrough();
        passThroughStream.pipe(res);

        const webWritableStream = Writable.toWeb(passThroughStream);
        const zipWriter = new zip.ZipWriter(webWritableStream);

        // 元の暗号化ZIPを読み込み
        zipReader = new zip.ZipReader(new zip.HttpReader(url));
        const entries = await zipReader.getEntries();

        // 各エントリを順番に復号して書き込み（高速化のため無圧縮 level: 0）
        const entriesLength = entries.length;
        for (let i = entriesLength - 1; i >= 0; i--) {
            const entry = entries[i];

            if (entry.directory) {
                await zipWriter.add(entry.filename, undefined, { directory: true });
                continue;
            }

            const options: zip.EntryGetDataOptions = { checkSignature: false };
            if (password) {
                options.password = password;
            }

            // 1ファイルごとに Uint8ArrayWriter で復号
            const decompressedData = await entry.getData!(
                new zip.Uint8ArrayWriter(), 
                options
            );

            // 無圧縮（level: 0）でストリームに流し込む
            await zipWriter.add(
                entry.filename, 
                new zip.Uint8ArrayReader(decompressedData), 
                { level: 0 }
            );
        }

        // 書き込み完了処理
        await zipWriter.close();
        await zipReader.close();

    } catch (error: any) {
        if (zipReader) await zipReader.close().catch(() => {});

        console.error('=== [Unlock Password Error] ===', error);

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
            message: isPasswordError ? 'パスワードが正しくないか暗号化エラーです' : 'パスワードの解除に失敗しました', 
            error: error?.message || String(error)
        });
    }
}
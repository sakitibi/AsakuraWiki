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
        // 元の暗号化ZIPを読み込み
        zipReader = new zip.ZipReader(new zip.HttpReader(url));
        const entries = await zipReader.getEntries();

        const zipWriter = new zip.ZipWriter(new zip.Uint8ArrayWriter());

        // 各エントリを順番に復号して新しいZIPに追加
        const entriesLength = entries.length;
        for (let i = entriesLength - 1; i >= 0; i--) {
            const entry = entries[i];
            // ディレクトリ（フォルダ）の場合
            if (entry.directory) {
                await zipWriter.add(entry.filename, undefined, { directory: true });
                continue;
            }

            // 非暗号化のデータ書き出し（TransformStreamを使ってストリーム処理）
            const transformStream = new TransformStream();
            const options: zip.EntryGetDataOptions = { checkSignature: false };
            if (password) {
                options.password = password;
            }

            // getData と add を並行でパイプ処理
            const getDataPromise = entry.getData!(transformStream.writable, options);
            await zipWriter.add(entry.filename, transformStream.readable);
            await getDataPromise;
        }

        // パスワード解除済みの新しいZIPバイナリを取得
        const unencryptedZipBuffer = await zipWriter.close();
        await zipReader.close();

        // クライアントヘ返信
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="unlocked.zip"');
        return res.status(200).send(Buffer.from(unencryptedZipBuffer));

    } catch (error: any) {
        if (zipReader) await zipReader.close().catch(() => {});

        console.error('=== [Unlock Password Error] ===', error);

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
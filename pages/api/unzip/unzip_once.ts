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
        bodyParser: false,
        responseLimit: false,
    },
    maxDuration: 60,
};

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
        const password = Array.isArray(req.query.password) ? req.query.password[0] : req.query.password;
        
        const sliceStart = parseInt(Array.isArray(req.query.slice_start) ? req.query.slice_start[0] : (req.query.slice_start || '0'), 10);
        const sliceEndParam = Array.isArray(req.query.slice_end) ? req.query.slice_end[0] : req.query.slice_end;
        const sliceEnd = sliceEndParam ? parseInt(sliceEndParam, 10) : undefined;

        if (!url) {
            return res.status(400).json({ message: 'URLを指定してください (?url=...)' });
        }

        let reader: zip.ZipReader<any> | null = null;

        try {
            console.log(`[Unzip Metadata Request] URL: ${url} | sliceStart: ${sliceStart} | sliceEnd: ${sliceEnd}`);

            reader = new zip.ZipReader(new zip.HttpReader(url));
            const allEntries = await reader.getEntries();
            
            const validEntries = allEntries.filter((entry) => 
                !entry.directory && 
                !entry.filename.includes('__MACOSX')
            );

            const targetedEntries = validEntries.slice(sliceStart, sliceEnd);

            const results: ExtractedFileMeta[] = targetedEntries.map((entry, i) => ({
                filename: entry.filename,
                size: entry.uncompressedSize,
                index: i
            }));

            await reader.close();
            reader = null;

            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('X-Total-Count', validEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());

            return res.status(200).json(results);

        } catch (error: any) {
            if (reader) {
                await reader.close().catch(() => {});
            }

            // --- 詳細なエラーログ出力 ---
            console.error('=== [Unzip Metadata Error Detail] ===');
            console.error('Target URL:', url);
            console.error('Error Name:', error?.name || 'UnknownError');
            console.error('Error Message:', error?.message || String(error));
            console.error('Error Stack:', error?.stack || 'No stack trace');
            if (error?.cause) console.error('Error Cause:', error.cause);
            console.error('======================================');
            
            const errorMsg = error?.message?.toLowerCase() || "";
            const isPasswordError = errorMsg.includes('password') || errorMsg.includes('signature') || errorMsg.includes('encrypted');
            
            return res.status(isPasswordError ? 401 : 500).json({ 
                message: isPasswordError ? 'パスワードが正しくないか、暗号化されています' : 'メタデータの取得に失敗しました', 
                error: error?.message || String(error),
                stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            });
        }
    } else {
        res.setHeader('Allow', ['GET', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
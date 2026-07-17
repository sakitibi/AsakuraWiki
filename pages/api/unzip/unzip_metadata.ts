import type { NextApiRequest, NextApiResponse } from 'next';
import * as zip from '@zip.js/zip.js';

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
        const sliceStart = parseInt(Array.isArray(req.query.slice_start) ? req.query.slice_start[0] : (req.query.slice_start || '0'), 10);
        const sliceEndParam = Array.isArray(req.query.slice_end) ? req.query.slice_end[0] : req.query.slice_end;
        const sliceEnd = sliceEndParam ? parseInt(sliceEndParam, 10) : undefined;

        if (!url) {
            return res.status(400).json({ message: 'URLを指定してください (?url=...)' });
        }

        try {
            const reader = new zip.ZipReader(new zip.HttpReader(url));
            const allEntries = await reader.getEntries();
            
            const validEntries = allEntries.filter((entry) => 
                !entry.directory && 
                !entry.filename.includes('__MACOSX')
            );

            const targetedEntries = validEntries.slice(sliceStart, sliceEnd);

            const results: ExtractedFileMeta[] = targetedEntries.map((entry, i) => ({
                filename: entry.filename,
                size: entry.uncompressedSize, // 解凍後のバイト数
                index: i
            }));

            await reader.close();
            
            // 60秒間 CDN キャッシュ
            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('X-Total-Count', validEntries.length.toString());
            res.setHeader('X-Slice-Start', sliceStart.toString());
            res.setHeader('X-Slice-End', (sliceEnd ?? validEntries.length).toString());

            return res.status(200).json(results);

        } catch (error: any) {
            console.error('Unzip Metadata Error:', error);
            return res.status(500).json({ 
                message: 'メタデータの取得に失敗しました', 
                error: error.message 
            });
        }
    }
}
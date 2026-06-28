import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'node:crypto';

interface FilePayload{
    fileName: string;
    fileContent: string;
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else if (req.method === "POST") {
        const body = req.body as FilePayload;
        const decodedb64 = Uint8Array.fromBase64(body.fileContent);
        
        const csvBlob = new Blob([decodedb64], { type: 'application/octet-stream' });

        // フォームデータの構築
        const formData = new FormData();
        formData.append('ajax', '1');
        formData.append('uuid', crypto.randomUUID().replaceAll("-", ""));
        formData.append('country', 'JP');
        formData.append('file_1', csvBlob, body.fileName);
        formData.append('file_1_name', body.fileName);
        formData.append('file_1_type', 'application/octet-stream');
        formData.append('filecnt', '1');

        // リクエスト送信
        const response = await fetch('https://ydc1-d.kuku.lu/upload.php', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            return res.status(500).json({success: false, error: "File Upload Failed."});
        }
        const data = await response.text();
        return res.status(200).json({success: true, url: data.slice(3, data.length)});
    } else {
        res.setHeader('Allow', ['POST','OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
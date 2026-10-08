import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'node:crypto';
import formidable from 'formidable';
import fs from 'node:fs';

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
    maxDuration: 300,
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
    } else if (req.method === "POST") {
        try {
            const form = formidable({ multiples: true });
            const [_, files] = await form.parse(req);

            const uploadedFiles: formidable.File[] = [];
            
            for (const key of Object.keys(files)) {
                const fileOrArray = files[key];
                if (Array.isArray(fileOrArray)) {
                    uploadedFiles.push(...fileOrArray);
                } else if (fileOrArray) {
                    uploadedFiles.push(fileOrArray);
                }
            }

            if (uploadedFiles.length === 0) {
                return res.status(400).json({ success: false, error: "No files provided." });
            }

            // 送信用 FormData の構築
            const formData = new FormData();
            formData.append('ajax', '1');
            formData.append('uuid', crypto.randomUUID().replaceAll("-", ""));
            formData.append('country', 'JP');

            // 受け取ったファイルを file_1, file_2 ... として追加
            uploadedFiles.forEach((file, index) => {
                const num = index + 1;
                
                // 一時ファイルを読み込んで Blob を作成
                const fileBuffer = fs.readFileSync(file.filepath);
                const fileBlob = new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' });

                const fileName = file.originalFilename || `file_${num}`;

                formData.append(`file_${num}`, fileBlob, fileName);
                formData.append(`file_${num}_name`, fileName);
                formData.append(`file_${num}_type`, file.mimetype || 'application/octet-stream');
            });

            // ファイル合計数を追加
            formData.append('filecnt', String(uploadedFiles.length));

            // リクエスト送信
            const response = await fetch('https://ydc1-d.kuku.lu/upload.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                return res.status(500).json({ success: false, error: "File Upload Failed." });
            }

            const data = await response.text();
            return res.status(200).json({ success: true, url: data.slice(3) });

        } catch (error) {
            console.error("Upload error:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    } else {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
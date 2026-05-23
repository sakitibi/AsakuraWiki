import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORSヘッダーの設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        const rawBodyBuffer = Buffer.concat(chunks);

        const contentType = req.headers['content-type'] || '';
        
        const formData = new FormData();
        
        // 固定のテキストデータをセット
        formData.append("ajax", "1");
        formData.append("uuid", "ce89a9087415bd430bf5f78a14fe38c3");
        formData.append("country", "JP");

        let isFileExtracted = false;

        const boundaryMatch = contentType.match(/boundary=(.+)/);
        if (boundaryMatch && rawBodyBuffer.length > 0) {
            const boundary = boundaryMatch[1];
            
            const targetHeader = 'name="file_1"';
            const headerIndex = rawBodyBuffer.indexOf(Buffer.from(targetHeader));

            if (headerIndex !== -1) {
                
                // ファイル名を動的に抽出するロジック
                let dynamicFileName = "uploaded_file.bin"; 
                const filenameKey = 'filename="';
                const filenameIndex = rawBodyBuffer.indexOf(Buffer.from(filenameKey), headerIndex);

                if (filenameIndex !== -1 && filenameIndex < rawBodyBuffer.indexOf(Buffer.from('\r\n\r\n'), headerIndex)) {
                    const fileNameStartIndex = filenameIndex + filenameKey.length;
                    const fileNameEndIndex = rawBodyBuffer.indexOf(Buffer.from('"'), fileNameStartIndex);
                    
                    if (fileNameEndIndex !== -1 && fileNameEndIndex > fileNameStartIndex) {
                        const fileNameBuffer = rawBodyBuffer.subarray(fileNameStartIndex, fileNameEndIndex);
                        const rawFileNameStr = fileNameBuffer.toString('utf-8');
                        try {
                            dynamicFileName = decodeURIComponent(escape(rawFileNameStr));
                        } catch {
                            dynamicFileName = rawFileNameStr;
                        }
                    }
                }

                // バイナリデータの開始位置（\r\n\r\n の後ろ）を取得
                const delimiter = Buffer.from('\r\n\r\n');
                const fileDataStartIndex = rawBodyBuffer.indexOf(delimiter, headerIndex) + delimiter.length;

                // バイナリデータの終了位置（次のboundaryの直前：\r\n--boundary）を取得
                const endBoundary = Buffer.from(`\r\n--${boundary}`);
                const fileDataEndIndex = rawBodyBuffer.indexOf(endBoundary, fileDataStartIndex);

                if (fileDataStartIndex !== -1 && fileDataEndIndex !== -1 && fileDataEndIndex > fileDataStartIndex) {
                    const fileBuffer = rawBodyBuffer.subarray(fileDataStartIndex, fileDataEndIndex);
                    
                    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
                    formData.append("file_1", blob, dynamicFileName);
                    isFileExtracted = true;
                }
            }
        }

        if (!isFileExtracted || !formData.has("file_1")) {
            return res.status(400).json({
                success: false,
                error: "リクエストバイナリから必要なファイル(file_1)を検出できませんでした。"
            });
        }

        const requestHeaders = new Headers();
        
        requestHeaders.set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0');
        requestHeaders.set('accept', '*/*');
        requestHeaders.set('accept-language', 'ja');
        requestHeaders.set('referer', 'https://d.kuku.lu/');
        requestHeaders.set('origin', 'https://d.kuku.lu');
        requestHeaders.set('priority', 'u=1, i');
        requestHeaders.set('sec-ch-ua', '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"');
        requestHeaders.set('sec-ch-ua-mobile', '?0');
        requestHeaders.set('sec-ch-ua-platform', '"macOS"');
        requestHeaders.set('sec-fetch-dest', 'empty');
        requestHeaders.set('sec-fetch-mode', 'cors');
        requestHeaders.set('sec-fetch-site', 'same-site');

        const targetUrl = 'https://tdc1-d.kuku.lu/upload.php'; 
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`外部API転送エラー: ${response.status}`);
        }

        const responseData = await response.text();

        return res.status(200).json({
            success: true,
            message: "ログのヘッダー情報を適用し、正常にデータを転送しました。",
            extractedFileName: formData.get("file_1") instanceof File ? (formData.get("file_1") as File).name : "unknown",
            apiResponse: responseData
        });

    } catch (error: any) {
        console.error("サーバー内エラー:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}
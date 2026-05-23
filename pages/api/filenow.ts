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
        const boundaryMatch = contentType.match(/boundary=(.+)/);

        let isFileExtracted = false;
        let dynamicFileName = "uploaded_file.bin";
        let fileBuffer: Buffer = Buffer.alloc(0);

        if (boundaryMatch && rawBodyBuffer.length > 0) {
            const boundary = boundaryMatch[1];
            const targetHeader = 'name="file_1"';
            const headerIndex = rawBodyBuffer.indexOf(Buffer.from(targetHeader));

            if (headerIndex !== -1) {
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

                const delimiter = Buffer.from('\r\n\r\n');
                const fileDataStartIndex = rawBodyBuffer.indexOf(delimiter, headerIndex) + delimiter.length;
                const endBoundary = Buffer.from(`\r\n--${boundary}`);
                const fileDataEndIndex = rawBodyBuffer.indexOf(endBoundary, fileDataStartIndex);

                if (fileDataStartIndex !== -1 && fileDataEndIndex !== -1 && fileDataEndIndex > fileDataStartIndex) {
                    fileBuffer = rawBodyBuffer.subarray(fileDataStartIndex, fileDataEndIndex);
                    isFileExtracted = true;
                }
            }
        }

        if (!isFileExtracted || fileBuffer.length === 0) {
            return res.status(400).json({
                success: false,
                error: "リクエストバイナリから必要なファイル(file_1)を検出できませんでした。"
            });
        }

        const serverUrl = 'https://d.kuku.lu/_server.php';
        
        const serverHeaders = new Headers();
        serverHeaders.set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0');
        serverHeaders.set('accept', 'application/json, text/javascript, */*; q=0.01');
        serverHeaders.set('accept-language', 'ja');
        serverHeaders.set('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        serverHeaders.set('referer', 'https://d.kuku.lu/upload.php?uuid=');
        serverHeaders.set('origin', 'https://d.kuku.lu');
        serverHeaders.set('x-requested-with', 'XMLHttpRequest');

        const uploadFilesJson = JSON.stringify({
            "0": {
                "filename": dynamicFileName,
                "size": fileBuffer.length
            }
        });

        const serverBody = new URLSearchParams();
        serverBody.set('action', 'getUploadURL');
        serverBody.set('upload_files', uploadFilesJson);

        console.log("URL発行APIにリクエストを送信中...");
        const serverResponse = await fetch(serverUrl, {
            method: 'POST',
            headers: serverHeaders,
            body: serverBody.toString()
        });

        if (!serverResponse.ok) {
            throw new Error(`URL発行APIエラー: ${serverResponse.status}`);
        }

        const serverResponseJson = await serverResponse.json();
        console.log("URL発行APIレスポンス取得完了:", serverResponseJson);

        if (serverResponseJson.result !== "OK" || !serverResponseJson.servers || serverResponseJson.servers.length === 0) {
            throw new Error("URL発行APIから有効なアップロード先URLを取得できませんでした。");
        }

        const targetUploadUrl = serverResponseJson.servers[0].url;
        console.log(`動的アップロード先URLに決定しました: ${targetUploadUrl}`);

        const formData = new FormData();
        formData.append("ajax", "1");
        formData.append("uuid", "ce89a9087415bd430bf5f78a14fe38c3");
        formData.append("country", "JP");

        const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/octet-stream' });
        formData.append("file_1", blob, dynamicFileName);

        const uploadHeaders = new Headers();
        uploadHeaders.set('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0');
        uploadHeaders.set('accept', '*/*');
        uploadHeaders.set('accept-language', 'ja');
        uploadHeaders.set('referer', 'https://d.kuku.lu/');
        uploadHeaders.set('origin', 'https://d.kuku.lu');

        console.log("動的URLへバイナリファイルをアップロード中...");
        const uploadResponse = await fetch(targetUploadUrl, {
            method: 'POST',
            headers: uploadHeaders,
            body: formData, 
        });

        const uploadResponseData = await uploadResponse.text();
        console.log("uploadResponseData: ", uploadResponseData);
        if (!uploadResponse.ok) {
            throw new Error(`外部アップロードAPI転送エラー: ${uploadResponse.status}`);
        }

        return res.status(200).json({
            success: true,
            message: "レスポンスからURLを動的に抽出し、ファイルのアップロードが正常に完了しました。",
            extractedFileName: dynamicFileName,
            fileSize: fileBuffer.length,
            dynamicTargetUrl: targetUploadUrl,
            serverApiResponse: serverResponseJson,
            uploadApiResponse: uploadResponseData
        });

    } catch (error: any) {
        console.error("サーバー内エラー:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}
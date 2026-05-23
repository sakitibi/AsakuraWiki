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

        // ファイルが正しく抽出できたかを管理するフラグ
        let isFileExtracted = false;

        // 5. 生のバイナリ（rawBodyBuffer）から、file_1 のデータとファイル名を動的に抽出
        const boundaryMatch = contentType.match(/boundary=(.+)/);
        if (boundaryMatch && rawBodyBuffer.length > 0) {
            const boundary = boundaryMatch[1];
            
            const targetHeader = 'name="file_1"';
            const headerIndex = rawBodyBuffer.indexOf(Buffer.from(targetHeader));

            if (headerIndex !== -1) {
                
                // --- ★ ファイル名を動的に抽出するロジック ---
                let dynamicFileName = "uploaded_file.bin"; // 抽出失敗時のデフォルト名
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
                            // 変換できない場合はそのまま使用
                            dynamicFileName = rawFileNameStr;
                        }
                    }
                }
                // ------------------------------------------

                // ヘッダー直後の、バイナリデータの開始位置（\r\n\r\n の後ろ）を取得
                const delimiter = Buffer.from('\r\n\r\n');
                const fileDataStartIndex = rawBodyBuffer.indexOf(delimiter, headerIndex) + delimiter.length;

                // バイナリデータの終了位置（次のboundaryの直前：\r\n--boundary）を取得
                const endBoundary = Buffer.from(`\r\n--${boundary}`);
                const fileDataEndIndex = rawBodyBuffer.indexOf(endBoundary, fileDataStartIndex);

                if (fileDataStartIndex !== -1 && fileDataEndIndex !== -1 && fileDataEndIndex > fileDataStartIndex) {
                    // 生のBufferから該当のバイナリ部分だけを切り出す
                    const fileBuffer = rawBodyBuffer.subarray(fileDataStartIndex, fileDataEndIndex);
                    
                    // MIMEタイプを 'application/octet-stream' に指定してBlobを作成
                    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });

                    // 抽出した動的なファイル名をセットしてFormDataに追加
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

        const targetUrl = 'https://tdc1-d.kuku.lu/upload.php'; // 実際の送信先URLに書き換えてください
        
        const response = await fetch(targetUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`外部API転送エラー: ${response.status}`);
        }

        const responseData = await response.text();

        return res.status(200).json({
            success: true,
            message: "req.bodyのバイナリからファイル名とデータを動的に抽出し、正常に転送しました。",
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
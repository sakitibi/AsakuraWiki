import type { NextApiRequest, NextApiResponse } from "next";

function generateRandomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;

    // 暗号学的に安全な乱数を使用
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % charsLength];
    }
    return result;
}

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    //const random = generateRandomString(10);
    /*const response1 = await fetch(
        "https://rc.wikiwiki.jp/api/v3/comments/maitestu-net/交流室",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "akidukisystems",
            },
            body: `name=マグロのユッケ#${random}&msg=同意見`
        }
    );
    const data1 = await response1.text();*/
    // 1. FormData オブジェクトを作成
    const formData = new FormData();

    // 2. 取得した各項目を append で追加
    formData.append('reply_to', ''); // 空データもそのまま空文字で追加
    formData.append('anonymous', '1');
    formData.append('nickname', 'マグロのユッケ');
    formData.append('content', '[熟成牛タン](https://wikiwiki.jp/maitestu-net/熟成牛タン)っていう悪質な荒らしがいます。');

    // 3. fetch 送信
    const response2 = await fetch('https://z.wikiwiki.jp/genshinwiki/topic/304', {
        method: 'POST',
        body: formData,
    })
    const data2 = await response2.text();

    if (/*!response1.ok || */!response2.ok) {
        return res.status(500).json({
            error: "counter2 fetch failed",
            data: `data1: , data2: ${data2}`
        });
    }

    
    return res.status(200).json({success: true});
}

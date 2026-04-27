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
    const random = generateRandomString(10);
    const response1 = await fetch(
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
    const data1 = await response1.text();
    const response2 = await fetch(
        "https://wikiwiki.jp/maitestu-net/::cmd/comment?refer=%E4%BA%A4%E6%B5%81%E5%AE%A4",
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Magical Girls",
            },
            body: "comment_no=0&nodate=0&above=1&name=マグロのユッケ&msg=%E7%86%9F%E6%88%90%E7%89%9B%E3%82%BF%E3%83%B3%E3%81%AF%E8%8D%92%E3%82%89%E3%81%97%E3%81%A0!&comment=%E6%8C%BF%E5%85%A5"
        }
    )
    const data2 = await response2.text();

    if (!response1.ok || !response2.ok) {
        return res.status(500).json({
            error: "counter2 fetch failed",
            data: `data1: ${data1}, data2: ${data2}`
        });
    }

    
    return res.status(200).json(data1);
}

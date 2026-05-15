import type { NextApiRequest, NextApiResponse } from "next";
import { chromium } from "playwright-core";

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
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === "GET") {
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
        /*const formData = new FormData();

        // 2. 取得した各項目を append で追加
        formData.append('reply_to', ''); // 空データもそのまま空文字で追加
        formData.append('anonymous', '1');
        formData.append('nickname', 'マグロのユッケ');
        formData.append('content', '緊急 [熟成牛タン](https://wikiwiki.jp/maitestu-net/熟成牛タン)っていう悪質な荒らしがいます。');

        // 3. fetch 送信
        const response2 = await fetch('https://z.wikiwiki.jp/genshinwiki/topic/304', {
            method: 'POST',
            body: formData,
        })
        const data2 = await response2.text();
*/
        let digest = null;
        let browser;
        try {
            // ブラウザの起動
            browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
            });

            // 提示された強力なCookieをセット
            await context.addCookies([
                { name: '__wwuid', value: 'oA4odJINeu...', domain: 'wikiwiki.jp', path: '/' },
                { name: '__cf_bm', value: 'm8ovwGaX6...', domain: 'wikiwiki.jp', path: '/' },
                { name: 'cf_clearance', value: 'sAjPbyVTn...', domain: 'wikiwiki.jp', path: '/' },
                { name: '__posted2', value: 'cdf', domain: 'wikiwiki.jp', path: '/' }
                // 必要に応じて他のCookieも同様の形式で追加してください
            ]);

            const page = await context.newPage();

            // 編集画面へアクセス
            console.log("WIKIWIKIアクセス中...");
            const response = await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'networkidle',
                timeout: 30000
            });

            console.log("Response Status: ", response?.status());

            if (response?.ok()) {
                const content = await page.content();
                
                // digestを取得
                const digestMatch = content.match(/"digest":"([a-f0-9]{32})"/);
                if (digestMatch) {
                    digest = digestMatch[1];
                    console.log("取得した digest: ", digest);
                } else {
                    console.error("digest が見つかりませんでした。");
                }
            } else {
                console.error("アクセス拒否されました。Status:", response?.status());
            }

            await browser.close();
            return res.status(200).json({ success: !!digest, data: digest });

        } catch (error: any) {
            if (browser) await browser.close();
            console.error("実行エラー:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
/*
        if (!response1.ok || !response2.ok) {
            return res.status(500).json({
                error: "counter2 fetch failed",
                data: `data1: , data2: ${data2}`
            });
        }*/
        return res.status(200).json({success: true, data: digest});
    }
}

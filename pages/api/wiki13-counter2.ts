import type { NextApiRequest, NextApiResponse } from "next";
import chromium from '@sparticuz/chromium-min';
import puppeteer, { Browser } from 'puppeteer-core';

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
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
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
        let digest: string | null = null;
        let browser: Browser | null = null;

        try {
            const incomingCookie = req.query.cookie;

            if (!incomingCookie || typeof incomingCookie !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    error: "Missing required 'cookie' parameter.",
                    hint: "ブラウザのEdgeから取得した、cf_clearance等を含むCookie文字列を送信してください。"
                });
            }

            const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL;
            if (isServerless) {
                chromium.setGraphicsMode = false;
            }

            const secureArgs = [
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1280,800',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--lang=ja-JP,ja'
            ];

            browser = await puppeteer.launch({
                args: isServerless ? [...chromium.args, ...secureArgs] : secureArgs,
                executablePath: isServerless 
                    ? await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
                    : undefined,
                headless: true,
            }) as unknown as Browser;

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(30000);

            // Edgeブラウザ環境の完全再現
            await page.setExtraHTTPHeaders({
                'accept-language': 'ja,ja-JP;q=0.9',
                'sec-ch-ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            });

            await page.setUserAgent({
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',
                userAgentMetadata: {
                    brands: [
                        { brand: 'Chromium', version: '148' },
                        { brand: 'Microsoft Edge', version: '148' },
                        { brand: 'Not/A)Brand', version: '99' }
                    ],
                    mobile: false,
                    platform: 'macOS',
                    platformVersion: '26.5.0',
                    architecture: 'arm',
                    bitness: '64',
                    model: ''
                }
            });

            // 外部から渡された「生きたCookie」を解析してブラウザにセット
            const cookies = incomingCookie.split('; ').map(pair => {
                const [name, ...valueParts] = pair.split('=');
                return {
                    name: name,
                    value: valueParts.join('='),
                    domain: '.wikiwiki.jp', 
                    path: '/'
                };
            });

            if (browser) {
                await browser.setCookie(...cookies);
            }

            console.log("外部提供Cookieを使用してWIKIWIKIへ直接アクセス...");
            await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'domcontentloaded'
            });

            // 有効な cf_clearance があれば、この待機ループは一瞬でスルーされます
            let attempts = 0;
            let currentTitle = await page.title();

            while ((currentTitle.includes("しばらくお待ちください") || currentTitle.includes("アクセス確認中") || currentTitle.includes("Just a moment")) && attempts < 5) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentTitle = await page.title();
                attempts++;
            }

            const content = await page.content();
            const digestMatch = content.match(/"digest"\s*:\s*"([a-f0-9]{32})"/);
            
            if (digestMatch) {
                const digest = digestMatch[1];
                await browser.close();
                return res.status(200).json({ success: true, data: digest });
            }

            await browser.close();
            return res.status(403).json({ 
                success: false, 
                error: "Digest missing. Cookie might be expired.",
                pageTitle: currentTitle
            });

        } catch (error: any) {
            if (browser) await browser.close();
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

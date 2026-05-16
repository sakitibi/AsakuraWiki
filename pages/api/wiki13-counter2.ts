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
            const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL;

            if (isServerless) {
                chromium.setGraphicsMode = false;
            }

            // 言語設定を含めた、より本物のブラウザに近い強力な隠蔽引数
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
            await page.setDefaultNavigationTimeout(45000);

            // ページのヘッダーおよび内部の言語設定を「日本語」に完全最適化
            await page.setExtraHTTPHeaders({
                'accept-language': 'ja,ja-JP;q=0.9',
                'sec-ch-ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            });

            // 先ほど解決した、modelを含んだ正しいオブジェクト形式のUA指定
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

            // あなたの最新のCookie
            const targetCookieStr = "__posted2=cdf; FCNEC=%5B%5B%22AKsRol8IJ4aV_iL-5fzt1fFr1_bnjvoLXbsEgvVjeyxDD1e30T9AwPV8dvhr3M0MwzAzXhe15k2fMoW1ycqrB_fUIsCqOAMsWNGULpw4st0hc1OcX2czaGIy5u5mL1clWm9BpVwvp_Kdvf-ktM8sHvvYSvaHPWBvzw%3D%3D%22%5D%5D; cto_bundle=OvMAo191NERhZXFQYmtMV1lCOFVMb05NampweEVvc0liZzUwRmlibUxmb3BNYTIyRlo4cm92RHJWVWlkcmdjUmhkODlhSDBtRVF2ZkVtYTBvbiUyRmptRWlaeng3RjJsMlNuMzY0aDFsNFVjaGpZVE5UOEpFVUlhdzRSMzZtd0ZoM3ZBVG9D; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%22286a83c8-9bfc-4d58-930b-f362dbd7f5e5%5C%22%2C%5B1778909967%2C846000000%5D%5D%22%5D%5D%5D; __wwuid=fMoeP9fSRcYnL%2BSV2fP%2FTXZGc0VpdnNOVFRvcU9TY3E5YmJRL0FvempCMGlnZHAzVXg1UkwvVFNlV1J5eml0MmxhR0x0NHF4WjFBU3JZUHE%3D; _ga=GA1.1.1791614899.1778909968; _ga_3Y8FN9EFS7=GS2.1.s1778909967$o1$g0$t1778909967$j60$l0$h0";

            const cookies = targetCookieStr.split('; ').map(pair => {
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
            console.log("WIKIWIKI編集画面へ完全日本語ローカライズアクセス開始...");
            await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'domcontentloaded'
            });

            // ページが切り替わるまで最大15秒間ループ待機
            let attempts = 0;
            let currentTitle = await page.title();
            console.log("初期タイトル:", currentTitle);

            while ((currentTitle.includes("しばらくお待ちください") || currentTitle.includes("アクセス確認中") || currentTitle.includes("Just a moment")) && attempts < 15) {
                console.log(`Cloudflare判定クリア待ち... (${attempts + 1}秒目)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentTitle = await page.title();
                attempts++;
            }

            const finalUrl = page.url();
            console.log("最終判定時のページタイトル:", currentTitle);

            const content = await page.content();
            const digestMatch = content.match(/"digest"\s*:\s*"([a-f0-9]{32})"/);
            
            if (digestMatch) {
                digest = digestMatch[1];
                console.log("【偽装完全成功】digest: ", digest);
                await browser.close();
                return res.status(200).json({ success: true, data: digest });
            }

            await browser.close();
            return res.status(403).json({ 
                success: false, 
                error: "Digest not found in HTML",
                debug: { url: finalUrl, pageTitle: currentTitle }
            });

        } catch (error: any) {
            if (browser) await browser.close();
            console.error("システムエラー:", error.message);
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

import type { NextApiRequest, NextApiResponse } from "next";
import chromium from '@sparticuz/chromium-min';
import vanillaPuppeteer from 'puppeteer-core';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import 'kind-of';

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

(puppeteer as any).vanilla = vanillaPuppeteer;
puppeteer.use(StealthPlugin());

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
        let browser: any = null;

        try {
            const incomingCookie = req.query.cookie;

            // Cookieが送られてこなかった場合は、分かりやすいエラーを返す
            if (!incomingCookie || typeof incomingCookie !== 'string') {
                return res.status(400).json({ 
                    success: false, 
                    error: "Required parameter 'cookie' is missing.",
                    hint: "EdgeのF12開発者ツールから取得した、cf_clearanceを含むクッキー文字列をパラメータとして送信してください。"
                });
            }

            const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL;

            if (isServerless) {
                chromium.setGraphicsMode = false;
            }

            // Cloudflareのロボット検知をすり抜けるための起動引数
            const secureArgs = [
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1280,800',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--lang=ja-JP,ja' // ブラウザ言語を日本語に強制
            ];

            // puppeteer-extra経由でブラウザを起動
            browser = await puppeteer.launch({
                args: isServerless ? [...chromium.args, ...secureArgs] : secureArgs,
                executablePath: isServerless 
                    ? await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
                    : undefined,
                headless: true,
            });

            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(45000);

            // 本物の日本語版Edge（Mac）のリクエストヘッダーを模倣
            await page.setExtraHTTPHeaders({
                'accept-language': 'ja,ja-JP;q=0.9',
                'sec-ch-ua': '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            });

            // 最新の型定義に準拠したUser-Agentの指定
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

            // 【マルチドメインCookie割当最適化】
            // cf_clearance 等の特殊なCookieが確実に送信されるよう、ドメイン指定を2パターン生成して重複登録します
            const parsedCookies: any[] = [];
            incomingCookie.split('; ').forEach(pair => {
                const [name, ...valueParts] = pair.split('=');
                const value = valueParts.join('=');
                
                // パターン1: サブドメイン全体用（.wikiwiki.jp）
                parsedCookies.push({
                    name, value, domain: '.wikiwiki.jp', path: '/'
                });
                // パターン2: ルートドメイン直接指定用（wikiwiki.jp）
                parsedCookies.push({
                    name, value, domain: 'wikiwiki.jp', path: '/'
                });
            });

            // browserレベルで一括Cookie注入
            if (browser) {
                await browser.setCookie(...parsedCookies);
            }

            console.log("マルチドメイン対応Cookieを使用してWIKIWIKIへ直接アクセス...");
            await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'domcontentloaded'
            });

            // Cloudflareの検証画面が表示されている場合の最大5秒の待機・監視ループ
            let attempts = 0;
            let currentTitle = await page.title();
            console.log("初期取得のページタイトル:", currentTitle);

            while ((currentTitle.includes("しばらくお待ちください") || currentTitle.includes("アクセス確認中") || currentTitle.includes("Just a moment")) && attempts < 5) {
                console.log(`検証通過を待機中... (${attempts + 1}秒目)`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                currentTitle = await page.title();
                attempts++;
            }

            const finalUrl = page.url();
            const content = await page.content();
            
            // 編集画面のHTML内から digest 属性を正規表現で引っこ抜く
            const digestMatch = content.match(/"digest"\s*:\s*"([a-f0-9]{32})"/);
            
            if (digestMatch) {
                digest = digestMatch[1];
                console.log("【成功】検問をすり抜け、digestを取得しました: ", digest);
                await browser.close();
                return res.status(200).json({ success: true, data: digest });
            }

            // 取得失敗時のデバッグ情報返却
            await browser.close();
            return res.status(403).json({ 
                success: false, 
                error: "Digest not found in HTML. The injected cookie might be expired.",
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

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

            // Cloudflareの検知を回避するための高度な起動引数
            const secureArgs = [
                '--disable-blink-features=AutomationControlled', // 自動操縦フラグを隠蔽
                '--disable-infobars',
                '--window-size=1280,800',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ];

            browser = await puppeteer.launch({
                args: isServerless ? [...chromium.args, ...secureArgs] : secureArgs,
                executablePath: isServerless 
                    ? await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
                    : undefined,
                headless: true,
            });

            const page = await browser.newPage();

            // ページ全体のタイムアウトを長めに設定（Cloudflare対策）
            await page.setDefaultNavigationTimeout(45000);

            // 【重要】JavaScript層での自動化フラグ（navigator.webdriver）の完全な隠蔽
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'languages', { get: () => ['ja', 'en-US', 'en'] });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
            });

            // 本物のMacブラウザに偽装するUser-Agentと各種ヘッダー
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
            });

            // 提供された強力なCookieをセット（ドメインを.wikiwiki.jpにしてサブドメイン間でも有効化）
            const cookieString = '__posted2=cdf; __flux_u=4310126cadbb43de8e745528567bfc5c; _flux_dataharbor=1; sharedid=a4c1646c-5029-4108-b0c7-b7bfd2367062; sharedid_cst=zix7LPQsHA%3D%3D; __flux_ls=0|0; _yjsu_yjad=1777557457.e7c882f7-498e-4163-a3b2-4e4a2a936cb8; _im_vid=01KQFAWJRA255GWSZDAEKZAMTV; _im_uid.1000283=h.fdccc57189d17cf4; _ga_574T4EBBPP=GS2.1.s1777643887$o1$g1$t1777643898$j49$l0$h0; _ga_GDH84L907P=GS2.2.s1777725526$o1$g0$t1777725526$j60$l0$h0; _ga_59ZET8EY2M=GS2.1.s1778062777$o1$g0$t1778062777$j60$l0$h0; _ga_F8Q0TT8VQ5=GS2.2.s1778062782$o2$g1$t1778062785$j57$l0$h0; __gsas=ID=a0ec81b797e620fd:T=1778062788:RT=1778062788:S=ALNI_MbhcasMQ0JfmsP_iNbJIU4juqAt1g; __wwuid=oA4odJINeuNE8yleDqjHGi9pajVqcTNFcFBIUWFWbmFYMDVpS08yak9DbUY2ZklWWURqM1dzdGlnMTZoeDZ4TzYrQVh0V0NEa1grWkRVTUQ%3D; cf_clearance=sAjPbyVTnHH.aB6pwkDBQOsUazlyMGYKxd91gVflQBo-1778301318-1.2.1.1-NchypnBfsGwNZHqcAo9yd6fwj2.3n_bepGXrRQeoIERfegWPF0x2HGSqaULLx0IwxxUbbGqFcpzqETLmyIQ1q.VIGZoQH1BMcxl8CZ8jDP3meCnOrESIdpuObq.9rnLh5MO4DwTzwevJdp107ZiRHEvWULkJEY5HehX2E8lLg_sSnDXiTedearrM1K4BKccRvsT2qratrOu6sJdhtimJT96iPQjRKL3lAETLTY2XvyQ9CP_d_MsKKH6D1XXo6WDyJ1fkCSftBVAdboMx6FzExc7qFRIqgPWgZVYWPIfzphdSdrK8NkZpe23QjI1_c99k7Q2bRja6u62xZ9MMbSSOwA; _gid=GA1.2.1551201066.1778849434; _ga_FDQCGWFP4C=GS2.2.s1778849434$o5$g0$t1778849434$j60$l0$h0; _ga=GA1.1.1731347394.1777557344; __cf_bm=m8ovwGaX6OsZAxPM5xvjOETJK.dVQiobp79lwmDBo.0-1778850717.6424494-1.0.1.1-mF9HnBgrJjxY9VH9I.1ebJviLYB2tWNjEEcSPE2Pa9KmqKiYHPTc9i5OeqRlpfgJ4GC9BJqK83G5G8zBNGd.fqtLwyySVQLciuyw7E3rFbECRvNiiVeDQag0j8fAOP9Q; cto_bundle=El5MQV9USmdDUllOSkslMkZrdTZKd2hxbzE5WiUyRnRSM1VMSnp2YTlqcmNUNkZDZXhNTmkyZWtaa2ViUDFMU0glMkZ4STdiTTRNZnhSaUdNWlJ4MVM3YWk4Rjg5UW93TWpCVlU1SzclMkZjcHdIVDNlV1lyQWp4WCUyRml0V3duTklZVmJSYXRPZTQ1MWc; cto_bidid=6lThVF9sU0loU1VJYjluYXJMY0RQZ1BDOEdzWiUyRmxp0JmOWp5a2tSdTlsc3hLJTJCYTglMkI2Z0d4bXRIY0JVRlRraDhibzRSelExaFhvd1k2dDN5MVBqbSUyQkpkMkRRJTNEJTNE; __gads=ID=a7dd0714a2b882bf:T=1777557458:RT=1778850733:S=ALNI_MbyyvTWlOpNHLyukWnni6z2SHKF2Q; __gpi=UID=000013ed98010cc1:T=1777557458:RT=1778850733:S=ALNI_MZBhdW7KmimR1JdPrNzlwYKxn0AIQ; __eoi=ID=aaa0234727bfbe49:T=1777557458:RT=1778850733:S=AA-AfjZuCaLn5-8C9vj11PpY2FyF; _ga_3Y8FN9EFS7=GS2.1.s1778848609$o26$g1$t1778851417$j60$l0$h0; __flux_s=1778850717790|1778850717790|0103239de54448a390c3c89627d2b730|2; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%228e5212f4-740a-4ff8-8f79-6571d8ebcac3%5C%22%2C%5B1777557343%2C863000000%5D%5D%22%5D%5D%5D; FCNEC=%5B%5B%22AKsRol8yvddAG0H50UkNQHDdRdpdoX53WPJOflFGWfgB45myjV9_NSQPR_PV8ppbiOI_62Mx7dJfaLwjDF9GhvsvKZo_CcBVTiNsinjq-T2SZUpZcg-RsKoGSEvHX-FLNiaqWDbh4qR0UNEDFEx0gbKLTxxUjhY5qg%3D%3D%22%5D%5D';

            const cookies = cookieString.split('; ').map(pair => {
                const [name, ...valueParts] = pair.split('=');
                return {
                    name: name,
                    value: valueParts.join('='),
                    domain: '.wikiwiki.jp', 
                    path: '/'
                };
            });

            await page.setCookie(...cookies);

            // 3. 画面遷移
            console.log("WIKIWIKIアクセス中...");
            const response = await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'domcontentloaded', // DOMの構築が終わった時点で次に進む
                timeout: 45000
            });

            // 【重要】Cloudflareの「しばらくお待ちください...」の検証パズルが自動で解けるまで5秒間待つ
            console.log("Cloudflareチャレンジ判定の待機中（5秒間）...");
            await new Promise(resolve => setTimeout(resolve, 5000));

            const currentUrl = page.url();
            const title = await page.title();
            console.log("待機完了後のURL:", currentUrl);
            console.log("待機完了後のページタイトル:", title);

            // HTMLソースの取得
            const content = await page.content();

            // 4. digestの抽出試行
            const digestMatch = content.match(/"digest":"([a-f0-9]{32})"/);
            
            if (digestMatch) {
                digest = digestMatch[1];
                console.log("取得成功 digest: ", digest);
            } else {
                if (content.includes("パスワード")) {
                    console.error("原因: パスワード入力画面（非ログイン状態）になっています。");
                } else if (title.includes("しばらくお待ちください") || content.includes("Cloudflare") || response?.status() === 403) {
                    console.error("原因: Cloudflareの無人チェックを突破できませんでした。");
                } else {
                    console.error("原因: 予期せぬHTML構造です。編集権限がない可能性があります。");
                }
            }

            await browser.close();

            if (!digest) {
                return res.status(403).json({ 
                    success: false, 
                    error: "Digest not found in HTML",
                    debug: { url: currentUrl, pageTitle: title }
                });
            }

            return res.status(200).json({ success: true, data: digest });

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

import type { NextApiRequest, NextApiResponse } from "next";
import chromium from '@sparticuz/chromium';
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
            // 1. サーバーレス環境でのブラウザ起動設定
            browser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                executablePath: await chromium.executablePath(),
                headless: true, // 常にバックグラウンド実行
            });

            const page = await browser.newPage();

            // 偽装用のUser-Agentを設定
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0');

            // 2. 提供された強力なCookieをセット（省略なし）
            const cookieString = '__posted2=cdf; __flux_u=4310126cadbb43de8e745528567bfc5c; _flux_dataharbor=1; sharedid=a4c1646c-5029-4108-b0c7-b7bfd2367062; sharedid_cst=zix7LPQsHA%3D%3D; __flux_ls=0|0; _yjsu_yjad=1777557457.e7c882f7-498e-4163-a3b2-4e4a2a936cb8; _im_vid=01KQFAWJRA255GWSZDAEKZAMTV; _im_uid.1000283=h.fdccc57189d17cf4; _ga_574T4EBBPP=GS2.1.s1777643887$o1$g1$t1777643898$j49$l0$h0; _ga_GDH84L907P=GS2.2.s1777725526$o1$g0$t1777725526$j60$l0$h0; _ga_59ZET8EY2M=GS2.1.s1778062777$o1$g0$t1778062777$j60$l0$h0; _ga_F8Q0TT8VQ5=GS2.2.s1778062782$o2$g1$t1778062785$j57$l0$h0; __gsas=ID=a0ec81b797e620fd:T=1778062788:RT=1778062788:S=ALNI_MbhcasMQ0JfmsP_iNbJIU4juqAt1g; __wwuid=oA4odJINeuNE8yleDqjHGi9pajVqcTNFcFBIUWFWbmFYMDVpS08yak9DbUY2ZklWWURqM1dzdGlnMTZoeDZ4TzYrQVh0V0NEa1grWkRVTUQ%3D; cf_clearance=sAjPbyVTnHH.aB6pwkDBQOsUazlyMGYKxd91gVflQBo-1778301318-1.2.1.1-NchypnBfsGwNZHqcAo9yd6fwj2.3n_bepGXrRQeoIERfegWPF0x2HGSqaULLx0IwxxUbbGqFcpzqETLmyIQ1q.VIGZoQH1BMcxl8CZ8jDP3meCnOrESIdpuObq.9rnLh5MO4DwTzwevJdp107ZiRHEvWULkJEY5HehX2E8lLg_sSnDXiTedearrM1K4BKccRvsT2qratrOu6sJdhtimJT96iPQjRKL3lAETLTY2XvyQ9CP_d_MsKKH6D1XXo6WDyJ1fkCSftBVAdboMx6FzExc7qFRIqgPWgZVYWPIfzphdSdrK8NkZpe23QjI1_c99k7Q2bRja6u62xZ9MMbSSOwA; _gid=GA1.2.1551201066.1778849434; _ga_FDQCGWFP4C=GS2.2.s1778849434$o5$g0$t1778849434$j60$l0$h0; _ga=GA1.1.1731347394.1777557344; __cf_bm=m8ovwGaX6OsZAxPM5xvjOETJK.dVQiobp79lwmDBo.0-1778850717.6424494-1.0.1.1-mF9HnBgrJjxY9VH9I.1ebJviLYB2tWNjEEcSPE2Pa9KmqKiYHPTc9i5OeqRlpfgJ4GC9BJqK83G5G8zBNGd.fqtLwyySVQLciuyw7E3rFbECRvNiiVeDQag0j8fAOP9Q; cto_bundle=El5MQV9USmdDUllOSkslMkZrdTZKd2hxbzE5WiUyRnRSM1VMSnp2YTlqcmNUNkZDZXhNTmkyZWtaa2ViUDFMU0glMkZ4STdiTTRNZnhSaUdNWlJ4MVM3YWk4Rjg5UW93TWpCVlU1SzclMkZjcHdIVDNlV1lyQWp4WCUyRml0V3duTklZVmJSYXRPZTQ1MWc; cto_bidid=6lThVF9sU0loU1VJYjluYXJMY0RQZ1BDOEdzWiUyRmxpMDJtOVp5a2tSdTlsc3hLJTJCYTglMkI2Z0d4bXRIY0JVRlRraDhibzRSelExaFhvd1k2dDN5MVBqbSUyQkpkMkRRJTNEJTNE; __gads=ID=a7dd0714a2b882bf:T=1777557458:RT=1778850733:S=ALNI_MbyyvTWlOpNHLyukWnni6z2SHKF2Q; __gpi=UID=000013ed98010cc1:T=1777557458:RT=1778850733:S=ALNI_MZBhdW7KmimR1JdPrNzlwYKxn0AIQ; __eoi=ID=aaa0234727bfbe49:T=1777557458:RT=1778850733:S=AA-AfjZuCaLn5-8C9vj11PpY2FyF; _ga_3Y8FN9EFS7=GS2.1.s1778848609$o26$g1$t1778851417$j60$l0$h0; __flux_s=1778850717790|1778850717790|0103239de54448a390c3c89627d2b730|2; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%228e5212f4-740a-4ff8-8f79-6571d8ebcac3%5C%22%2C%5B1777557343%2C863000000%5D%5D%22%5D%5D%5D; FCNEC=%5B%5B%22AKsRol8yvddAG0H50UkNQHDdRdpdoX53WPJOflFGWfgB45myjV9_NSQPR_PV8ppbiOI_62Mx7dJfaLwjDF9GhvsvKZo_CcBVTiNsinjq-T2SZUpZcg-RsKoGSEvHX-FLNiaqWDbh4qR0UNEDFEx0gbKLTxxUjhY5qg%3D%3D%22%5D%5D';

            const cookies = cookieString.split('; ').map(pair => {
                const [name, ...valueParts] = pair.split('=');
                return {
                    name: name,
                    value: valueParts.join('='),
                    domain: '.wikiwiki.jp', // サブドメイン全体に適用可能にするためドットを追加
                    path: '/'
                };
            });

            await page.setCookie(...cookies);

            // 3. WIKIWIKIの編集ページへアクセス
            console.log("WIKIWIKIアクセス中...");
            await page.goto("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // HTMLソースの取得
            const content = await page.content();
            
            // digestを取得
            const digestMatch = content.match(/"digest":"([a-f0-9]{32})"/);
            if (digestMatch) {
                digest = digestMatch[1];
                console.log("取得した digest: ", digest);
            } else {
                console.error("digest が見つかりませんでした。");
            }

            await browser.close();

            if (!digest) {
                return res.status(403).json({ success: false, error: "Digest not found in HTML" });
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

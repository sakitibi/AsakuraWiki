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
        let digest;
        try {
            console.log("フィンガープリント擬態モードでWIKIWIKIへアクセス開始...");

            const targetCookie = "__posted2=cdf; FCNEC=%5B%5B%22AKsRol8IJ4aV_iL-5fzt1fFr1_bnjvoLXbsEgvVjeyxDD1e30T9AwPV8dvhr3M0MwzAzXhe15k2fMoW1ycqrB_fUIsCqOAMsWNGULpw4st0hc1OcX2czaGIy5u5mL1clWm9BpVwvp_Kdvf-ktM8sHvvYSvaHPWBvzw%3D%3D%22%5D%5D; cto_bundle=OvMAo191NERhZXFQYmtMV1lCOFVMb05NampweEVvc0liZzUwRmlibUxmb3BNYTIyRlo4cm92RHJWVWlkcmdjUmhkODlhSDBtRVF2ZkVtYTBvbiUyRmptRWlaeng3RjJsMlNuMzY0aDFsNFVjaGpZVE5UOEpFVUlhdzRSMzZtd0ZoM3ZBVG9D; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%22286a83c8-9bfc-4d58-930b-f362dbd7f5e5%5C%22%2C%5B1778909967%2C846000000%5D%5D%22%5D%5D%5D; __wwuid=fMoeP9fSRcYnL%2BSV2fP%2FTXZGc0VpdnNOVFRvcU9TY3E5YmJRL0FvempCMGlnZHAzVXg1UkwvVFNlV1J5eml0MmxhR0x0NHF4WjFBU3JZUHE%3D; _ga=GA1.1.1791614899.1778909968; _ga_3Y8FN9EFS7=GS2.1.s1778909967$o1$g0$t1778909967$j60$l0$h0";


            const headers = new Headers();
            headers.append("Host", "wikiwiki.jp");
            headers.append("Connection", "keep-alive");
            headers.append("Pragma", "no-cache");
            headers.append("Cache-Control", "no-cache");
            headers.append("sec-ch-ua", '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"');
            headers.append("sec-ch-ua-mobile", "?0");
            headers.append("sec-ch-ua-platform", '"macOS"');
            headers.append("Upgrade-Insecure-Requests", "1");
            headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0");
            headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
            headers.append("Sec-Fetch-Site", "same-origin");
            headers.append("Sec-Fetch-Mode", "navigate");
            headers.append("Sec-Fetch-User", "?1");
            headers.append("Sec-Fetch-Dest", "document");
            headers.append("Referer", "https://wikiwiki.jp/maitestu-net/");
            headers.append("Accept-Encoding", "gzip, deflate, br");
            headers.append("Accept-Language", "ja");
            headers.append("Cookie", targetCookie);

            // Fetchリクエストの実行
            const response = await fetch("https://wikiwiki.jp/maitestu-net/::cmd/edit?page=FrontPage", {
                method: "GET",
                headers: headers,
                keepalive: true 
            });

            const content = await response.text();

            // digestの抽出
            const digestMatch = content.match(/"digest":"([a-f0-9]{32})"/);
            
            if (digestMatch) {
                digest = digestMatch[1];
                console.log("【偽装成功】digest: ", digest);
                return res.status(200).json({ success: true, data: digest });
            }

            // ブロックされた場合の解析
            const titleMatch = content.match(/<title>([^<]+)<\/title>/);
            const pageTitle = titleMatch ? titleMatch[1] : "タイトル不明";
            console.error("取得失敗時のページタイトル:", pageTitle);

            if (pageTitle.includes("しばらくお待ちください") || content.includes("Cloudflare")) {
                return res.status(403).json({ 
                    success: false, 
                    error: "Cloudflare Fingerprint Blocked", 
                    reason: "通信のフィンガープリント（TLS/HTTP2の挙動）がBotと判定されました。VercelのIP自体が弾かれている可能性があります。"
                });
            }

            return res.status(404).json({ success: false, error: "Digest missing from HTML" });

        } catch (error: any) {
            console.error("API実行エラー:", error.message);
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

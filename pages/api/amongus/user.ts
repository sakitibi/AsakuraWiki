import type { NextApiRequest, NextApiResponse } from "next";
import upack from '@/node_modules/upack.js/src/index';

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Amongusのトークンを取得
    const res1 = await fetch("https://asakura-wiki.vercel.app/api/amongus/token");
    if (!res1.ok) {
        const errdata = await res1.text();
        return res.status(500).json({error: "token error", data: errdata});
    }
    const data1 = await res1.json();
    const auth_token = new TextDecoder().decode(
        upack.SEncoder.decodeSEncode(
            data1.token,
            process.env.NEXT_PUBLIC_UPACK_SECRET_KEY
        )
    );

    // ヘッダーをセット
    const headers = new Headers();
    headers.set("Host", "matchmaker-as.among.us")
    headers.set("X-Unity-Version", "2022.3.44f1")
    headers.set("Accept", "text/plain")
    headers.set("baggage", "sentry-environment=production,sentry-public_key=7d060819d94d41f3ab7569154dccdcd5,sentry-release=Among%20Us%402026.4.7,sentry-trace_id=ab4fcbbca8194bcea5ac9be5a6aff102")
    headers.set("Authorization", `Bearer ${auth_token}`)
    headers.set("Accept-Encoding", "gzip, deflate, br")
    headers.set("Accept-Language", "ja")
    headers.set("sentry-trace", "ab4fcbbca8194bcea5ac9be5a6aff102-8783ca69fcb04104-0")
    headers.set("Content-Type", "application/json")
    headers.set("Content-Length", "114")
    headers.set("User-Agent", "AmongUs/1 CFNetwork/3860.500.112 Darwin/25.4.0")
    headers.set("Connection", "keep-alive")
    const response = await fetch(
        "https://matchmaker-as.among.us/api/user",
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                "Puid": "0002d597a46a4c7dad0eac919ff5baed",
                "Username": "13人TVバン65回",
                "ClientVersion": 50656250,
                "Language": 11
            })
        }
    );
    const data2 = await response.text();
    const auth_token_with_lobby = 
    upack.SEncoder.encodeSEncode(
        new TextEncoder().encode(data2).buffer,
        process.env.NEXT_PUBLIC_UPACK_SECRET_KEY
    );
    if (!response.ok) {
        return res.status(401).json({error: data2, auth_token});
    }
    
    return res.status(200).json({
        obfuscate: "upack.js",
        token: auth_token_with_lobby
    });
}

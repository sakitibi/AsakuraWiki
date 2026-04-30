import type { NextApiRequest, NextApiResponse } from "next";

interface auth_token {
    access_token: string;
    token_type: string;
    expires_at: string;
    features: string[];
    organization_id: string;
    product_id: string;
    sandbox_id: string;
    deployment_id: string;
    expires_in: number;
}

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    // Amongusのトークンを取得
    const res1 = await fetch("/api/amongus/token");
    const data1:auth_token = await res1.json();
    const auth_token = data1.access_token;

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
    const data = await response.text();

    if (!response.ok) {
        res.status(500).json({ error: "user fetch failed", data });
        return;
    }
    
    res.status(200).json({token: data});
}

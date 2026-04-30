import type { NextApiRequest, NextApiResponse } from "next";

export interface auth_token {
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const baseURL = "https://api.epicgames.dev";
        const headers = new Headers();
        headers.set("Host", baseURL)
        headers.set("Accept", "application/json")
        headers.set("Authorization", `Basic ${process.env.AMONGUS_BASIC_TOKEN}`)
        headers.set("X-EOS-Version", "1.16.4-36327603")
        headers.set("X-Epic-Correlation-ID", "EOS-zahDnl2rSru2tVyFmbR7Jg-Lsd9VfgzReK15-0Pmj-M7g")
        headers.set("Accept-Encoding", "gzip, deflate, br")
        headers.set("Accept-Language", "ja")
        headers.set("Content-Type", "application/x-www-form-urlencoded")
        headers.set("Content-Length", "76")
        headers.set("User-Agent", "EOS-SDK/1.16.4-36327603 (IOS/26.4) AmongUs/1.0")
        headers.set("Connection", "keep-alive")
        headers.set("Cookie", process.env.AMONGUS_AUTH_COOKIE!)
        const response1 = await fetch(
            `${baseURL}/auth/v1/oauth/token`,
            {
                method: "POST",
                headers,
                body: "grant_type=client_credentials&deployment_id=503cd077a7804777aee5a6eeb5cfe62d"
            }
        );

        if (!response1.ok) {
            return res.status(500).json({ error: "token fetch failed" });
        }

        const data1:auth_token = await response1.json();

        headers.set("Authorization", `Bearer ${data1.access_token}`)
        headers.set("Content-Type", "application/json")
        headers.set("Content-Length", "55")
        const response2 = await fetch("https://api.epicgames.dev/user/v9/product-users/search", {
            method: "POST",
            headers,
            body: JSON.stringify({
                "productUserIds": [
                    "0002d597a46a4c7dad0eac919ff5baed"
                ]
            })
        });

        if (!response2.ok) {
            return res.status(500).json({ error: "token send failed" });
        }
        return res.status(200).json(data1);
    } catch (error) {
        return res.status(500).json({ error: "network error" });
    }
}

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
    organization_user_id?: string;
    product_user_id?: string;
    product_user_id_created?: boolean;
    id_token?: string;
    expires_in: number;
}

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const baseURL = "https://api.epicgames.dev";
    const headers = new Headers();
    headers.set("Host", baseURL)
    headers.set("Accept", "application/json")
    headers.set("Authorization", `Basic ${process.env.AMONGUS_BASIC_TOKEN}`)
    headers.set("X-EOS-Version", "1.16.4-36327603")
    headers.set("X-Epic-Correlation-ID", "EOS-QDWIvI9xTIeal7SpikTdhw-w7FxUpjtRhOuy595n0JArA")
    headers.set("Accept-Encoding", "gzip, deflate, br")
    headers.set("Accept-Language", "ja")
    headers.set("Content-Type", "application/x-www-form-urlencoded")
    headers.set("User-Agent", "EOS-SDK/1.16.4-36327603 (IOS/26.4) AmongUs/1.0")
    headers.set("Connection", "keep-alive")
    headers.set("Cookie", process.env.AMONGUS_AUTH_COOKIE!)
    const response1_temp = await fetch(
        `${baseURL}/auth/v1/oauth/token`,
        {
            method: "POST",
            headers,
            body: "grant_type=client_credentials&deployment_id=503cd077a7804777aee5a6eeb5cfe62d"
        }
    );

    if (!response1_temp.ok) {
        return res.status(500).json({ error: "token_temp fetch failed" });
    }

    const data1_temp:auth_token = await response1_temp.json();
    
    const response1 = await fetch(
        `${baseURL}/auth/v1/oauth/token`,
        {
            method: "POST",
            headers,
            body: `grant_type=external_auth&external_auth_type=apple_id_token&external_auth_token=${data1_temp.access_token}&deployment_id=503cd077a7804777aee5a6eeb5cfe62d&display_name=13%E4%BA%BATV%E3%83%90%E3%83%B365%E5%9B%9E`
        }
    );

    if (!response1.ok) {
        return res.status(500).json({ error: "token fetch failed" });
    }

    const data1:auth_token = await response1.json();

    headers.set("Authorization", `Bearer ${data1.id_token}`)
    headers.set("Content-Type", "application/json")
    headers.set("Content-Length", "55")
    const response2 = await fetch("https://api.epicgames.dev/user/v9/product-users/search", {
        method: "POST",
        headers,
        body: JSON.stringify({
            "productUserIds": [
                data1.product_user_id
            ]
        })
    });

    if (!response2.ok) {
        return res.status(500).json({ error: "token send failed" });
    }
    return res.status(200).json(data1);
}

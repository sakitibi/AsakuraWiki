import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const headers = new Headers();
        headers.set("Host", "api.epicgames.dev")
        headers.set("Accept", "application/json")
        headers.set("Authorization", `Basic ${process.env.AMONGUS_BASIC_TOKEN}`)
        headers.set("X-EOS-Version", "1.16.4-36327603")
        headers.set("X-Epic-Correlation-ID", "EOS-5szem212SHC5I_lN_nvt1Q-cQIUNgq0TCmtgffNu3fl8A")
        headers.set("Accept-Encoding", "gzip, deflate, br")
        headers.set("Accept-Language", "ja")
        headers.set("Content-Type", "application/x-www-form-urlencoded")
        headers.set("Content-Length", "76")
        headers.set("User-Agent", "EOS-SDK/1.16.4-36327603 (IOS/26.4) AmongUs/1.0")
        headers.set("Connection", "keep-alive")
        headers.set("Cookie", process.env.AMONGUS_AUTH_COOKIE!)
        const response = await fetch(
            "https://api.epicgames.dev/auth/v1/oauth/token",
            {
                method: "POST",
                headers,
                body: "grant_type=client_credentials&deployment_id=503cd077a7804777aee5a6eeb5cfe62d"
            }
        );

        if (!response.ok) {
            res.status(500).json({ error: "token fetch failed" });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "network error" });
    }
}

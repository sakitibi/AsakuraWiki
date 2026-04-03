import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const response = await fetch(
            "https://counter.wikiwiki.jp/c/13ninstudio/pv/index.html",
            {
                headers: {
                    "User-Agent": "asakura-wiki-server",
                },
            }
        );

        if (!response.ok) {
            res.status(500).json({ error: "counter fetch failed" });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "network error" });
    }
}

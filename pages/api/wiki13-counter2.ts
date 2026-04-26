import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const response = await fetch(
            "https://rc.wikiwiki.jp/api/v3/comments/maitestu-net/%E8%AD%9C%E4%BB%A3%E9%89%84%E9%81%93",
            {
                method: "GET",
                headers: {
                    "User-Agent": "akidukisystems",
                },
            }
        );

        if (!response.ok) {
            res.status(500).json({ error: "counter2 fetch failed" });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "network error" });
    }
}

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const response = await fetch(
            "https://rc.wikiwiki.jp/api/v3/comments/maitestu-net/交流室",
            {
                method: "POST",
                headers: {
                    "User-Agent": "akidukisystems",
                },
                body: 'name=匿名しゃけ&msg=そういえば1年以上前の熟成牛タンっていう荒らしどうなったんだろ'
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

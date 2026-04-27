import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const random = Math.random();
        const response1 = await fetch(
            "https://rc.wikiwiki.jp/api/v3/comments/maitestu-net/交流室",
            {
                method: "POST",
                headers: {
                    "User-Agent": "akidukisystems",
                },
                body: `name=匿名しゃけ&msg=そういえば1年以上前の熟成牛タンっていう荒らしどうなったんだろう。#${random}`
            }
        );
        const response2 = await fetch(
            "https://wikiwiki.jp/maitestu-net/::cmd/edit?page=MenuBar",
            {
                method: "POST",
                headers: {
                    "User-Agent": "Magical Girls",
                },
                body: "digest=8e6260a9418d77a78276f2907a0e4228&original=*%E3%83%AA%E3%83%B3%E3%82%AF+%5B%23i830077d%5D%0D%0A%2F%2F+%E3%81%93%E3%81%AE%E3%83%9A%E3%83%BC%E3%82%B8%E3%81%AFWiki%E5%85%A8%E4%BD%93%E3%81%AB%E5%8F%8D%E6%98%A0%E3%81%95%E3%82%8C%E3%81%BE%E3%81%99%E3%80%82%0D%0A%2F%2F+%E5%90%84%E3%83%9A%E3%83%BC%E3%82%B8%E5%86%85%E3%81%A7%E3%81%AE%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%83%90%E3%83%BC%E3%82%92%E7%B7%A8%E9%9B%86%E3%81%97%E3%81%9F%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AF%E3%80%80%28%E3%83%9A%E3%83%BC%E3%82%B8%E5%90%8D%29%2FMenuBar%E3%80%80%E3%81%8B%E3%82%89%E7%B7%A8%E9%9B%86%E3%81%97%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82%0D%0A%2F%2F+%E6%98%8E%E3%82%89%E3%81%8B%E3%81%ABWiki%E5%85%A8%E4%BD%93%E3%81%B8%E3%81%AE%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC%E3%83%90%E3%83%BC%E3%81%A8%E3%81%97%E3%81%A6%E9%81%A9%E5%88%87%E3%81%A7%E3%81%AA%E3%81%84%E6%9B%B4%E6%96%B0%E3%81%AF%E3%80%81%E7%A2%BA%E8%AA%8D%E6%AC%A1%E7%AC%AC%E5%B7%AE%E3%81%97%E6%88%BB%E3%81%97%E3%81%95%E3%82%8C%E3%81%BE%E3%81%99%E3%80%82%0D%0A%2F%2F+%E3%83%9E%E3%82%A4%E9%89%84%E8%8D%92%E3%82%89%E3%81%97%E5%AF%BE%E7%AD%96%E5%A7%94%E5%93%A1%E4%BC%9A%0D%0A%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88X%3Ehttps%3A%2F%2Fx.com%2Fmytetsu_network%5D%5D%0D%0A%5B%5BMinecraft+Wiki%3Ahttps%3A%2F%2Fminecraft-ja.gamepedia.com%2FMinecraft_Wiki%5D%5D%0D%0A%5B%5BTraincraft%E3%80%80DL%3Ahttp%3A%2F%2Fwww.minecraftforum.net%2Fforums%2Fmapping-and-modding%2Fminecraft-mods%2F1287038-traincraft-4-2-1%5D%5D%0D%0A%5B%5BRailcraft%E3%80%80DL%3Ahttp%3A%2F%2Fwww.railcraft.info%2Freleases%5D%5D%0D%0A*%E3%83%A1%E3%83%8B%E3%83%A5%E3%83%BC+%5B%23m84c2076%5D%0D%0A-%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88%E3%81%A8%E3%81%AF%5D%5D%0D%0A--%5B%5B%E5%8F%82%E5%8A%A0%E6%96%B9%E6%B3%95%5D%5D%0D%0A%23hr%0D%0A-%5B%5B%E5%8F%82%E5%8A%A0%E7%A4%BE%E4%B8%80%E8%A6%A7%5D%5D%0D%0A-%5B%5B%E7%9B%B4%E9%80%9A%E8%B7%AF%E7%B7%9A%E5%9B%B3%5D%5D%0D%0A-%5B%5B%E9%80%A3%E7%B5%A1%E6%8E%B2%E7%A4%BA%E6%9D%BF%5D%5D%0D%0A-%5B%5B%E6%96%B0%E7%9D%80%E5%8B%95%E7%94%BB%E6%83%85%E5%A0%B1%5D%5D%0D%0A-%5B%5B%E5%8F%82%E5%8A%A0%E7%A4%BEIC%E3%82%AB%E3%83%BC%E3%83%89%5D%5D%0D%0A-%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E4%BC%81%E7%94%BB%5D%5D%0D%0A--%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E7%AA%93%E5%8F%A3%5D%5D%0D%0A--%5B%5BTwitter%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%3E%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88Twitter%E3%83%A9%E3%83%B3%E3%82%AD%E3%83%B3%E3%82%B0%5D%5D%0D%0A--%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88%E6%9C%88%E5%88%8A%E8%AA%8C%3E%E3%83%9E%E3%82%A4%E9%89%84%E4%BC%81%E7%94%BB%2F%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88%E6%9C%88%E5%88%8A%E8%AA%8C%5D%5D%0D%0A--%5B%5B%E7%B4%A0%E6%9D%90%E9%85%8D%E5%B8%83%E6%89%80%3E%E3%82%A2%E3%83%AA%E3%82%A2%E3%81%95%E3%82%93%E3%81%AE%E7%B4%A0%E6%9D%90%E9%85%8D%E5%B8%83%E6%89%80%5D%5D%0D%0A--%5B%5B%E3%83%9E%E3%82%A4%E9%89%84%E3%83%8D%E3%83%83%E3%83%88%E5%8A%A0%E7%9B%9F%E8%80%85%E5%90%91%E3%81%91%E9%83%BD%E5%B8%82%E9%96%8B%E7%99%BA%E3%82%B5%E3%83%BC%E3%83%9"
            }
        )

        if (!response1.ok || !response2.ok) {
            res.status(500).json({ error: "counter2 fetch failed" });
            return;
        }

        const data = await response1.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "network error" });
    }
}

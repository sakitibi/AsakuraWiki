import { NextApiRequest, NextApiResponse } from "next";

function nthIndexOf(str:string, search: string, n:number) {
    if (typeof str !== "string" || typeof search !== "string" || typeof n !== "number" || n < 1) {
        throw new Error("引数が不正です");
    }

    let index = -1;
    let fromIndex = 0;

    for (let i = 0; i < n; i++) {
        index = str.indexOf(search, fromIndex);
        if (index === -1) return -1; // 見つからなければ終了
        fromIndex = index + search.length; // 次の検索開始位置
    }
    return index;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // CORSヘッダーの設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    const body = req.body;
    console.log("body: ", req.body);
    const list = body.urls;
    console.log("list: ", list);
    let jsonArray = [];
    for (let i = 0;i < list.length;i++) {
        const response = await fetch(`https://www.youtube.com/playlist?list=${list[i]}`);
        const data = await response.text();
        
        let slice = data.slice(
            data.indexOf('{"responseContext":{"serviceTrackingParams'),
            nthIndexOf(data, 'if (window.ytcsi)', 5) - 49
        );

        const lastBraceIndex = slice.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            slice = slice.substring(0, lastBraceIndex + 1);
        }

        const jsonObject = JSON.parse(slice);
        jsonArray.push(jsonObject);
    }
    return res.status(200).json(jsonArray);
}
import { NextApiRequest, NextApiResponse } from 'next';

let items: string[] = []; // Base64文字列として保存

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === "POST") {
        // req.body を UTF-8 → Uint8Array に変換
        let u8 = new TextEncoder().encode(req.body);

        // 各バイトを +50 する
        for (let i = 0; i < u8.length; i++) {
            u8[i] += 50;
        }

        // ------- Base64 に変換 -------
        const base64 = Buffer.from(u8).toString("base64");

        items.push(base64);

        return res.status(201).json({ base64 });
    }

    if (req.method === "GET") {
        // Base64 のまま返す
        return res.status(200).json({ items });
    }

    res.setHeader('Allow', ['POST','GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

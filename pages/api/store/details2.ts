import { NextApiRequest, NextApiResponse } from 'next';

let items:Uint8Array<ArrayBuffer>[] = [];

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === "POST") {
        let body:Uint8Array<ArrayBuffer> = new TextEncoder().encode(req.body);
        for(let i = 0;i < body.length;i++){
            body[i]+=50;
        }
        items.push(body);
        return res.status(201).json({});
    } else if(req.method === "GET") {
        return new Response(JSON.stringify({ items }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } else {
        res.setHeader('Allow', ['POST','GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

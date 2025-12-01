import { supabaseServer } from "@/lib/supabaseClientServer";
import { adminerUserId } from "@/utils/user_list";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: false, // バイナリそのまま扱う
    },
};

let items: Buffer[] = []; // +50 加工されたバイナリを保存

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "POST") {
        const chunks: Buffer[] = [];

        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }

        const buf = Buffer.concat(chunks);

        // --- POST: バイナリの各バイト +50 ---
        const edited = Buffer.from(buf.map((v) => v + 50));

        items.push(edited);

        return res.status(201).send("OK");
    }

    if (req.method === "GET") {
        // ====== 認証ユーザー取得 ======
        let userId: string | null = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1]
            const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
            if (authError) console.error('Supabase auth error:', authError)
            if (user) userId = user.id
        }
        const adminer_user_id_list:boolean = Boolean(adminerUserId.find(value => value === userId));
        if(adminer_user_id_list){
            if (items.length === 0) {
                return res.status(200).send(Buffer.alloc(0));
            }

            // 保存されたバイナリを全て結合
            const merged = Buffer.concat(items);

            // --- GET: 各バイト -50 して元に戻す ---
            const restored = Buffer.from(merged.map((v) => v - 50));

            res.setHeader("Content-Type", "application/octet-stream");
            res.setHeader("Content-Length", restored.length);

            return res.status(200).send(restored);
        } else {
            return res.status(403).send({});
        }
    }

    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

//import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';
import { brotliDecompressSync } from 'zlib';
/*import upack from '@/node_modules/upack.js/src/index';
import { decodeBase64Unicode } from '@/lib/base64';
import { adminerUserId } from '@/utils/user_list';*/

interface JSONProps {
    id: number;
    name: string;
    kana: string;
    dept: string;
    location: string;
    seat: string;
    joined: string;
    team: string;
    birthday?: string;
    intro?: string;
    comment?: string;
}

// 1つのURLを処理するヘルパー関数
async function fetchAndDecompress(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 解凍
    const decompressed = brotliDecompressSync(buffer);
    
    // JSONとしてパース（テキストなら .toString() のみでOK）
    return JSON.parse(decompressed.toString('utf-8'));
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    // 取得したいURLのリスト
    const urls = [
        'https://sakitibi.github.io/13nin.com/staff_credits/staff_data_1_64.json.br',
        'https://sakitibi.github.io/13nin.com/staff_credits/staff_data_65_128.json.br',
    ];

    try {
        //let userId: string | null = null;
        const authHeader = req.headers.authorization/*new TextDecoder().decode(
            upack.SEncoder.decodeSEncode(
                decodeBase64Unicode(req.headers.authorization ?? ""),
                process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!
            )!
        );
        const { data: { user } } = await supabaseServer.auth.getUser(authHeader);
        if (user) userId = user.id;
        const isAdmin = adminerUserId.includes(userId || '');*/

        if (req.method === "GET") {
            // すべてのURLを並列で実行
            if (authHeader !== process.env.NEXT_PUBLIC_UPACK_SECRET_KEY) {
                return res.status(401).json({error: "Unauthorized"});
            }
            const array = await Promise.all(urls.map(url => fetchAndDecompress(url)));
            console.log("array: ", array);
            const staff_data: JSONProps[] = array.map((data) => {
                return data.staff_data
            }).flat();
            console.log("staff_data: ", staff_data);
            const results = staff_data.map((data) => {
                data.birthday = data.birthday?.replace(
                    /\b(?:19\d{2}|200\d)年(\d{1,2})月(\d{1,2})日/g,
                    (_, month, day) => {
                        const m = Number(month);
                        const d = Number(day);

                        // 1月1日 ～ 4月1日
                        const isBeforeApril =
                            (m >= 1 && m <= 3) ||
                            (m === 4 && d === 1);

                        return isBeforeApril
                            ? `2014年${m}月${d}日`
                            : `2013年${m}月${d}日`;
                    }
                );
                return data;
            });
            console.log("results: ", results);

            return res.status(200).json(results);
        }

        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
    } catch (error) {
        console.error('Batch Processing Error:', error);
        return res.status(500).json({ error: '一部またはすべてのデータの取得・解凍に失敗しました' });
    }
}
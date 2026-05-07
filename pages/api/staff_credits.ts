//import { supabaseServer } from '@/lib/supabaseClientServer';
import { NextApiRequest, NextApiResponse } from 'next';
import { constants, brotliCompressSync, brotliDecompressSync } from 'zlib';
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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
            const results = staff_data.map((data, index) => {
                const shouldSkipReplace = (index >= 77 && index <= 80) || (index >= 83 && index <= 90);

                if (shouldSkipReplace) {
                    let year = null;
                    if (index === 85){
                        year = 2019;
                    } else if (index === 83){
                        year = 2018;
                    } else if (index === 77 || index === 86 || index === 87){
                        year = 2016;
                    } else if (index === 78 || index === 88){
                        year = 2015;
                    } else if (index === 79 || index === 80 || index === 90){
                        year = 2014;
                    }
                    data.birthday = data.birthday?.replace(
                        /\b(?:19\d{2}|200\d)年(\d{1,2})月(\d{1,2})日/g,
                        (_, month, day) => {
                            const m = Number(month);
                            const d = Number(day);
                            return `${year}年${m}月${d}日`;
                        }
                    );
                } else {
                    data.birthday = data.birthday?.replace(
                        /\b(?:19\d{2}|200\d)年(\d{1,2})月(\d{1,2})日/g,
                        (_, month, day) => {
                            const m = Number(month);
                            const d = Number(day);
                            const isBeforeApril = (m >= 1 && m <= 3) || (m === 4 && d === 1);
                            return isBeforeApril ? `2014年${m}月${d}日` : `2013年${m}月${d}日`;
                        }
                    );
                }

                // 改行の置換は全データ共通で実行
                data.intro = data.intro?.replaceAll("\n", "\\n");
                data.comment = data.comment?.replaceAll("\n", "\\n");
                return data;
            });
            console.log("results: ", results);

            const jsonString = JSON.stringify(results);
            // 文字列を明示的に Buffer に変換してから圧縮
            const compressedBuffer = brotliCompressSync(Buffer.from(jsonString), {
                params: {
                    [constants.BROTLI_PARAM_QUALITY]: 11,
                },
            });

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Length', compressedBuffer.length);

            return res.status(200).send(compressedBuffer);
        }

        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
    } catch (error) {
        console.error('Batch Processing Error:', error);
        return res.status(500).json({ error: '一部またはすべてのデータの取得・解凍に失敗しました' });
    }
}
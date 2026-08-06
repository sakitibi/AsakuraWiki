import { supabaseClient } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import upack from '@/node_modules/upack.js/src/index';

export function isOneHourEarlier(referenceDate: Date) {
    if (!(referenceDate instanceof Date)) {
        throw new Error("referenceDate は有効な Date オブジェクトである必要があります");
    }

    const now = new Date();
    const diffMs = referenceDate.getTime() - now.getTime(); // 基準 - 現在
    const oneHourMs = 60 * 60 * 1000;

    return diffMs >= oneHourMs;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === "GET") {
        const {data, error} = await supabaseClient
            .from("wiki_variables")
            .select("value,updated_at")
            .eq("id", "a7869bcb-1c09-b4b2-4939-d382a5f27247")
            .single()
        if (error) {
            return res.status(500).json({error: error});
        }
        const date = new Date(data.updated_at);
        if (!data.value || isOneHourEarlier(date)) {
            return res.status(500).json({error: "token is null"});
        }
        const encrypted = await upack.SEncoder.encodeSEncode(
            new TextEncoder().encode(data.value).buffer,
            process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
            5
        );
        return res.status(200).json({
            obfuscate: "upack.js",
            token: encrypted ?? null
        })
    }

    if (req.method === "PUT") {
        const body = req.body;
        
        const response1 = await fetch("https://api.epicgames.dev:443/sdk/v1/default?platformId=IOS", {
            method: "GET",
            headers: {
                "x-eos-version": "1.19.0.3-49960398",
                "user-agent": "EOS-SDK/1.19.0.3-49960398 (IOS/26.5) AmongUs/1.0",
                "accept-encoding": "gzip",
                "accept-language": "ja",
                host: "api.epicgames.dev",
                "x-epic-correlation-id": "EOS-Ha2V_58pRYGzvYm6du4sVQ-WU_2eSYlQQ-Zx72n9b9yZQ",
                accept: "application/json",
                connection: "keep-alive",
                authorization: "CC858E6E3A4EDD565D0B30818F944F40",
            },
        });

        const headers1 = Object.fromEntries(response1.headers.entries());
        const data1 = await response1.json();

        const {error} = await supabaseClient
            .from("wiki_variables")
            .update([{
                value: body,
                updated_at: new Date()
            }])
            .eq("id", "a7869bcb-1c09-b4b2-4939-d382a5f27247")
        if (error) {
            return res.status(500).json({error})
        }
        return res.status(200).json({
            success: true,
            data: {
                res1: {
                    data: data1,
                    headers: headers1
                }
            }
        });
    }
}
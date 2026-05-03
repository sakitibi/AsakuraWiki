import { supabaseClient } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

function isOneHourEarlier(referenceDate: Date) {
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
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT');

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
        return res.status(200).json({token: data.value ?? null})
    }

    if (req.method === "PUT") {
        const body = req.body;
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
        return res.status(204).json({success: true});
    }
}
import { supabaseClient } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT');

    if (req.method === "GET") {
        const {data, error} = await supabaseClient
            .from("wiki_variables")
            .select("value")
            .eq("id", "a7869bcb-1c09-b4b2-4939-d382a5f27247")
            .single()
        if (error) {
            return res.status(500).json({error: error});
        }
        if (!data.value) {
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
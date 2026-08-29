import { supabaseClient } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import upack from '@/node_modules/upack.js/src/index';
import { importPublicKey } from "@/lib/secureObfuscator";

function generateRandomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    const charsLength = chars.length;

    // 暗号学的に安全な乱数を使用
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % charsLength];
    }
    return result;
}

export function isOneDayEarlier(referenceDate: Date) {
    if (!(referenceDate instanceof Date)) {
        throw new Error("referenceDate は有効な Date オブジェクトである必要があります");
    }

    const now = new Date();
    const diffMs = referenceDate.getTime() - now.getTime(); // 基準 - 現在
    const oneDayMs = 24 * 60 * 60 * 1000;

    return diffMs >= oneDayMs;
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

        const response = await fetch("https://api.epicgames.dev:443/auth/v1/oauth/token", {
            method: "POST",
            headers: {
                connection: "keep-alive",
                "user-agent": "EOS-SDK/1.19.0.3-49960398 (IOS/26.5) AmongUs/1.0",
                "x-eos-version": "1.19.0.3-49960398",
                "x-epic-correlation-id": "EOS-j1paBsBeRC6OSGsH0uOGOQ-9n1cSWXfQ_-jpuL2BMBJcg",
                host: "api.epicgames.dev",
                accept: "application/json",
                authorization: `Basic ${process.env.AMONG_EPICAPIKEY}`,
                "accept-language": "ja",
                "accept-encoding": "gzip",
                "content-type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=external_auth&external_auth_type=apple_id_token&external_auth_token=${data.value}&deployment_id=503cd077a7804777aee5a6eeb5cfe62d&nonce=${generateRandomString(22)}&display_name=14人TVバン66回`,
        });
        const resdata = await response.json();

        if (!response.ok) {
            return res.status(500).json({error: "oauth_token failed."});
        }

        const date = new Date(data.updated_at);
        if (!data.value || isOneDayEarlier(date)) {
            return res.status(500).json({error: "token is null"});
        }
        const encrypted = await upack.SEncoder.encodeSEncode(
            new TextEncoder().encode(resdata.id_token).buffer,
            await importPublicKey(process.env.NEXT_PUBLIC_UPACK_B64KEYPAIR?.split(",")[0]!),
            5
        );
        return res.status(200).json({
            obfuscate: "upack.js",
            token: encrypted ?? null
        })
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
        return res.status(200).json({
            success: true,
        });
    }
}
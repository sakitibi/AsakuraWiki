import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import upack from 'upack';
import { decodeBase64Unicode } from '@/lib/base64';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

const credentials = Buffer.from(
    `${process.env.EOS_CLIENT_ID}:${process.env.EOS_CLIENT_SECRET}`
).toString('base64');

function deriveEosCredentials(supabaseUserId: string, index: number) {
    const secretSalt = process.env.SERVER_SECRET_SALT || '';
    const sourceMaterial = `${supabaseUserId}_account_${index}_${secretSalt}`;
    
    const hashHex = crypto.createHash('sha256').update(sourceMaterial).digest('hex');

    const deviceId = `dev_${hashHex.substring(0, 32)}`;
    const password = hashHex.substring(32, 64);

    return { deviceId, password };
}

async function registerAndFetchEosToken(deviceId: string, password: string) {
    const tokenUrl = 'https://api.epicgames.dev/auth/v1/oauth/token';
    const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    });
    
    if (!tokenRes.ok) return tokenRes; // トークン取得自体に失敗した場合はそのまま返す
    const tokenData = await tokenRes.json();
    const serverAccessToken = tokenData.access_token;

    const connectUrl = 'https://api.epicgames.dev/connect/v1/accounts/externalAuth';
    const response = await fetch(connectUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${serverAccessToken}`,
        },
        body: new URLSearchParams({
            identityProviderId: 'deviceid_credentials',
            externalAccountId: deviceId,
            externalAccountPassword: password,
            autoCreateProductUserId: 'true',
            deploymentId: process.env.EOS_DEPLOYMENT_ID!
        }).toString(),
    });

    return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { supabaseToken: supabaseTokenRaw } = req.body;

    if (!supabaseTokenRaw) {
        return res.status(400).json({ error: 'Missing supabaseToken' });
    }
    
    const supabaseToken = await upack.SEncoder.decodeSEncode(
        decodeBase64Unicode(supabaseTokenRaw),
        process.env.NEXT_PUBLIC_UPACK_SECRET_KEY!,
        true,
    ) as string;

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseToken);

    if (authError || !user) {
        return res.status(401).json({ error: 'Unauthorized Supabase Token' });
    }

    const userId = user.id;

    try {
        // カウント情報と、既存の配列型カラムを一緒にセレクトする
        let { data: counter, error: dbError } = await supabaseAdmin
            .from('user_eos_counters')
            .select('account_count, product_user_id, device_id')
            .eq('user_id', userId)
            .single();

        let nextIndex = 0;
        let isNewUser = false;

        if (dbError && dbError.code === 'PGRST116') {
            nextIndex = 0;
            isNewUser = true;
        } else if (counter) {
            nextIndex = counter.account_count;
        } else {
            throw new Error('Database error');
        }

        const { deviceId, password } = deriveEosCredentials(userId, nextIndex);

        const eosResponse = await registerAndFetchEosToken(deviceId, password);

        const rawResponseText = await eosResponse.text();

        if (!eosResponse.ok) {
            let detail = rawResponseText;
            try {
                const errJson = JSON.parse(rawResponseText);
                detail = JSON.stringify(errJson);
            } catch (e) {
                detail = rawResponseText || `Status: ${eosResponse.status}`;
            }
            
            console.error('--- EOS API Error Detail ---', detail);
            return res.status(500).json({ error: `EOS Signup Failed: ${detail}` });
        }

        const eosData = JSON.parse(rawResponseText);
        
        const puid = eosData.productUserId || eosData.product_user_id;

        if (!puid) {
            return res.status(500).json({ error: 'EOS Success but Product User ID was not found in response.' });
        }
        // ==========================================

        if (isNewUser) {
            const { error: insertError } = await supabaseAdmin
                .from('user_eos_counters')
                .insert({ 
                    user_id: userId, 
                    account_count: 1,
                    product_user_id: [puid],
                    device_id: [deviceId]
                });
                
            if (insertError) throw insertError;
        } else if (counter) {
            const currentEosIds = counter.product_user_id || [];
            const currentDeviceIds = counter.device_id || [];

            const updatedEosIds = [...currentEosIds, puid];
            const updatedDeviceIds = [...currentDeviceIds, deviceId];

            const { error: updateError } = await supabaseAdmin
                .from('user_eos_counters')
                .update({ 
                    account_count: nextIndex + 1,
                    product_user_id: updatedEosIds,
                    device_id: updatedDeviceIds
                })
                .eq('user_id', userId);
                
            if (updateError) throw updateError;
        }

        return res.status(201).json({
            message: 'New EOS account registered successfully',
            accountIndex: nextIndex,
            access_token: eosData.accessToken || eosData.access_token,
            product_user_id: puid,
            expires_in: eosData.expiresIn || eosData.expires_in
        });

    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
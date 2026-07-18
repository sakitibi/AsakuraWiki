import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import upack from 'upack';
import { decodeBase64Unicode } from '@/lib/base64';

const ALLOWED_ORIGINS = ['https://asakura-wiki.vercel.app', 'https://sakitibi.github.io'];

const credentials = Buffer.from(
    `${process.env.EOS_CLIENT_ID}:${process.env.EOS_CLIENT_SECRET}`
).toString('base64');

// ユーザーIDとインデックスからデバイスIDとパスワードを計算
function deriveEosCredentials(supabaseUserId: string, index: number) {
    const secretSalt = process.env.SERVER_SECRET_SALT || '';
    const sourceMaterial = `${supabaseUserId}_account_${index}_${secretSalt}`;
    
    const hashHex = crypto.createHash('sha256').update(sourceMaterial).digest('hex');

    const deviceId = `dev_${hashHex.substring(0, 32)}`;
    const password = hashHex.substring(32, 64);

    return { deviceId, password };
}

async function registerAndFetchEosToken(deviceId: string, password: string) {
    const url = 'https://api.epicgames.dev/auth/v1/oauth/token';
    
    const bodyParams = new URLSearchParams({
        grant_type: 'client_credentials',
        external_auth_method: 'deviceid_credentials',
        external_auth_token: `${deviceId}:${password}`
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
        },
        body: bodyParams.toString(),
    });

    return response;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'null'); // 許可しない場合
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

    console.log('--- upack Decode Result ---');
    console.log('Type of result:', typeof supabaseToken);
    console.log('Content:', supabaseToken);

    // 1. SupabaseのJWTを検証
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseToken);

    if (authError || !user) {
        console.error('--- Supabase Auth Verification Failed ---');
        console.error('Auth Error Detail:', authError);
        console.error('Sent Token:', supabaseToken ? `${supabaseToken.substring(0, 15)}...` : 'null');
        return res.status(401).json({ error: 'Unauthorized Supabase Token' });
    }

// --- (中略、handler関数の前半部分と userId の取得まではそのまま) ---

    const userId = user.id;

    try {
        let { data: counter, error: dbError } = await supabaseAdmin
            .from('user_eos_counters')
            .select('account_count, product_user_id, device_id')
            .eq('user_id', userId)
            .single();

        let nextIndex = 0;
        let isNewUser = false;

        if (dbError && dbError.code === 'PGRST116') {
            // まだレコードがない新規ユーザーの場合
            nextIndex = 0;
            isNewUser = true;
        } else if (counter) {
            // 既にレコードが存在する既存ユーザーの場合
            nextIndex = counter.account_count;
        } else {
            throw new Error('Database error');
        }

        const { deviceId, password } = deriveEosCredentials(userId, nextIndex);

        const eosResponse = await registerAndFetchEosToken(deviceId, password);

        if (!eosResponse.ok) {
            const errText = await eosResponse.text();
            return res.status(500).json({ error: `EOS Signup Failed: ${errText}` });
        }

        const eosData = await eosResponse.json();

        if (isNewUser) {
            const { error: insertError } = await supabaseAdmin
                .from('user_eos_counters')
                .insert({
                    user_id: userId,
                    account_count: 1,
                    product_user_id: [eosData.product_user_id],
                    device_id: [deviceId]
                });
                
            if (insertError) throw insertError;
        } else if (counter) {
            const currentEosIds = counter.product_user_id || [];
            const currentDeviceIds = counter.device_id || [];

            const updatedEosIds = [...currentEosIds, eosData.product_user_id];
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
            access_token: eosData.access_token,
            product_user_id: eosData.product_user_id,
            expires_in: eosData.expires_in
        });

    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_ORIGINS = [
  "https://asakura-wiki.vercel.app",
  "https://sakitibi.github.io"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- CORS 設定 ---
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, headers, body, query } = req;
  const adminIdHeader = headers['x-admin-id'] as string;

  // 1. POST: スキル設定の新規作成
  if (method === 'POST') {
    const { config_id, admin_id, config } = body;
    const { data, error } = await supabase
      .from('snr2_skill_configs') // スキル専用テーブル
      .insert([{ config_id, admin_id, config }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: 'Success: Skill config created', data });
  }

  // --- GET & PUT 用の共通検証 ---
  const configId = (method === 'GET' ? query.config_id : body.config_id) as string;
  
  if (!configId || !adminIdHeader) {
    return res.status(400).json({ error: 'Missing config_id or x-admin-id header' });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('snr2_skill_configs')
    .select('admin_id, config')
    .eq('config_id', configId)
    .single();

  if (fetchError || !existing) return res.status(404).json({ error: 'Skill config not found' });
  
  // admin_id の一致検証
  if (existing.admin_id !== adminIdHeader) {
    return res.status(403).json({ error: 'Admin ID mismatch' });
  }

  // 2. GET: 設定取得
  if (method === 'GET') {
    return res.status(200).json(existing.config);
  }

  // 3. PUT: 既存設定の更新
  if (method === 'PUT') {
    const { config } = body;
    const { error: updateError } = await supabase
      .from('snr2_skill_configs')
      .update({ config, updated_at: new Date() })
      .eq('config_id', configId)
      .eq('admin_id', adminIdHeader);

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ message: 'Success: Skill config updated' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

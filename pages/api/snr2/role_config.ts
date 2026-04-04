import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers, body } = req;
  const adminIdHeader = headers['x-admin-id'] as string; // カスタムヘッダーから取得

  // --- POST: 新規作成 (検証なし) ---
  if (method === 'POST') {
    const { config_id, admin_id, config } = body;
    const { data, error } = await supabase
      .from('snr2_role_configs')
      .insert([{ config_id, admin_id, config }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: 'Created', data });
  }

  // --- GET & PUT 用の共通検証ロジック ---
  // クエリまたはボディから config_id を特定
  const configId = (method === 'GET' ? req.query.config_id : body.config_id) as string;

  if (!configId || !adminIdHeader) {
    return res.status(400).json({ error: 'config_id と x-admin-id ヘッダーが必要です。' });
  }

  // DBから現在の設定をフェッチして admin_id を確認
  const { data: existing, error: fetchError } = await supabase
    .from('snr2_role_configs')
    .select('admin_id, config')
    .eq('config_id', configId)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: '指定された設定が見つかりません。' });
  }

  // 管理者IDの一致検証
  if (existing.admin_id !== adminIdHeader) {
    return res.status(403).json({ error: '管理者IDが一致しません。' });
  }

  // --- GET: 取得 ---
  if (method === 'GET') {
    return res.status(200).json(existing.config);
  }

  // --- PUT: 更新 ---
  if (method === 'PUT') {
    const { config } = body;
    const { data: updated, error: updateError } = await supabase
      .from('snr2_role_configs')
      .update({ config })
      .eq('config_id', configId)
      .select();

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ message: 'Updated', updated });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

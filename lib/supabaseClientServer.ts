// lib/supabaseClientServer.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // サーバー専用のキー
);
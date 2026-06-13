import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabaseServer:SupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
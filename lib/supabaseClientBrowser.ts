// lib/supabaseClientBrowser.ts
import { createBrowserClient } from '@supabase/ssr' // ← ssr対応ブラウザ用

export const supabaseBrowser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
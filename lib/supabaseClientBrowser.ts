// lib/supabaseClientServer.ts
import { createBrowserClient } from '@supabase/ssr' // ← ssr対応ブラウザ用

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseServer = createBrowserClient(supabaseUrl, supabaseAnonKey)
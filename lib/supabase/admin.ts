import "server-only"
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const secret = process.env.SUPABASE_SECRET!

// Single, privileged client (bypasses RLS). Keep this server-only.
export const supabaseAdmin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
})

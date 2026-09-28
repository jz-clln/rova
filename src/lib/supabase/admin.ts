// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Only import this from server actions or
// route handlers, never from a "use client" file, and never expose the key.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing Supabase service role environment variables");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
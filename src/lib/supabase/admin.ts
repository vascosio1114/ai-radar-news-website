/**
 * Admin service-role Supabase client.
 * Use this for server-side admin operations that need to bypass RLS.
 * This client uses the service role key — NEVER expose it to the browser.
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Admin service-role Supabase client.
 * Use this for server-side admin operations that need to bypass RLS.
 * This client uses the service role key — NEVER expose it to the browser.
 */

export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

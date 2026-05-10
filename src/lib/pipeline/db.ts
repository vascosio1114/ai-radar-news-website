/**
 * Service-role Supabase client for pipeline scripts.
 * BYPASSES Row Level Security — never import from client components.
 *
 * Returns a loosely-typed client (`SupabaseClient<any, any, any>`) so we can
 * insert/update without bumping into Supabase v2's strict Database generic.
 * Per-row safety comes from the `RawItem` / `Source` types in `@/types`.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const auditLog = logger.child({ component: "audit" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

let _client: AnyClient | null = null;

export function pipelineDb(): AnyClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as AnyClient;
  return _client;
}

/** Insert a row into audit_logs without throwing on failure. */
export async function audit(
  actor: string,
  action: string,
  target_type?: string,
  target_id?: string,
  payload: Record<string, unknown> = {}
) {
  try {
    await pipelineDb()
      .from("audit_logs")
      .insert({ actor, action, target_type, target_id, payload });
  } catch (e) {
    auditLog.warn({ err: e }, "[audit] failed");
  }
}

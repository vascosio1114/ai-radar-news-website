import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminCheck = {
  user: User | null;
  isAdmin: boolean;
  source: "app_metadata" | "profiles" | "none";
};

export async function getCurrentAdmin(): Promise<AdminCheck> {
  const authDb = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await authDb.auth.getUser();

  if (error || !user) {
    return { user: null, isAdmin: false, source: "none" };
  }

  // Primary source: Supabase Auth app metadata (safe server-controlled claims).
  if (user.app_metadata?.role === "admin" || user.app_metadata?.is_admin === true) {
    return { user, isAdmin: true, source: "app_metadata" };
  }

  // Secondary source: public.profiles.is_admin.
  // This supports the Admin Users page toggle. If the DB column is not migrated yet,
  // fail closed instead of blocking the whole request with a 500.
  const adminDb = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminDb
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileError && profile?.is_admin === true) {
    return { user, isAdmin: true, source: "profiles" };
  }

  return { user, isAdmin: false, source: "none" };
}

export async function requireAdminApi() {
  const admin = await getCurrentAdmin();

  if (!admin.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!admin.isAdmin) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Admin access required. Set raw_app_meta_data.role = admin or profiles.is_admin = true." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    user: admin.user,
    adminDb: createSupabaseAdminClient(),
  };
}

/**
 * Server-side auth helpers — for Server Components, Route Handlers, Server Actions.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: "free" | "premium";
};

export type AuthState = {
  user: User | null;
  profile: Profile | null;
};

/** Get the current logged-in user, or null if not authenticated. */
export async function getUser(): Promise<User | null> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/** Get the current user + their public profile (with display name, avatar, plan). */
export async function getUserWithProfile(): Promise<AuthState> {
  const user = await getUser();
  if (!user) return { user: null, profile: null };

  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, plan")
      .eq("id", user.id)
      .single();
    return { user, profile: (data as Profile) ?? null };
  } catch {
    return { user, profile: null };
  }
}

/** Lightweight: just return true if user is logged in. */
export async function isLoggedIn(): Promise<boolean> {
  return (await getUser()) !== null;
}

/** True if user is logged in AND has paid plan. */
export async function isPremium(): Promise<boolean> {
  const { profile } = await getUserWithProfile();
  return profile?.plan === "premium";
}

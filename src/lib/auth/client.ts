"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function signUpWithPassword(opts: {
  email: string;
  password: string;
  displayName?: string;
}) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signUp({
    email: opts.email,
    password: opts.password,
    options: {
      data: { full_name: opts.displayName },
    },
  });
}

export async function signInWithPassword(opts: {
  email: string;
  password: string;
}) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithPassword({
    email: opts.email,
    password: opts.password,
  });
}

/** Redirect to Supabase Google OAuth flow. */
export async function signInWithGoogle(opts: { redirectTo?: string } = {}) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        opts.redirectTo ?? `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.signOut();
}

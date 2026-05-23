"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function translateLoginError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "電郵或密碼不正確。";
  }
  if (lower.includes("email not confirmed")) {
    return "請先完成電郵驗證後再登入。";
  }
  return message || "登入失敗，請稍後再試。";
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "not_admin") {
      setError("此帳戶尚未獲授管理員權限。請確認 Supabase Auth 的 raw_app_meta_data.role 為 admin，或 profiles.is_admin 為 true。");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      if (!data.session || !data.user) {
        throw new Error("登入未能建立 session，請確認帳戶是否已完成電郵驗證。");
      }

      // Use a full navigation so the server-side admin layout can read the new Supabase cookies
      // and perform the final admin permission check server-side.
      window.location.assign("/admin");
    } catch (err) {
      setError(translateLoginError((err as Error).message));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/90 p-8 shadow-2xl shadow-blue-950/20">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300/80">
            Admin Console
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold">登入管理後台</h1>
          <p className="mt-2 text-sm text-zinc-400">
            請使用已獲授權的管理員帳戶登入。
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "登入中…" : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}

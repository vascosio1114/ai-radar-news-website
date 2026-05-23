"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";
type AuthLang = "zh" | "en";

export function AuthForm({
  mode,
  lang = "zh",
}: {
  mode: Mode;
  lang?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uiLang: AuthLang = lang === "en" ? "en" : "zh";
  const nextUrl = searchParams.get("next") || `/${uiLang}`;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState<null | "email" | "google">(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading("email");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextUrl);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          },
        });
        if (error) throw error;
        setInfo(
          uiLang === "zh"
            ? "✓ 註冊成功！請前往收件箱完成電郵驗證。"
            : "✓ Registration successful. Please check your inbox to confirm your email address."
        );
      }
    } catch (err) {
      setError(translateError((err as Error).message, uiLang));
    } finally {
      setLoading(null);
    }
  }

  async function onGoogle() {
    setError(null);
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });
      if (error) throw error;
      // OAuth flow takes over; we never return here
    } catch (err) {
      setError(translateError((err as Error).message, uiLang));
      setLoading(null);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {uiLang === "zh" ? (isLogin ? "登入 AI Radar" : "註冊 AI Radar") : (isLogin ? "Log in to AI Radar" : "Create your AI Radar account")}
      </h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        {uiLang === "zh"
          ? isLogin
            ? "歡迎回來。登入後即可解鎖文章全文與 premium 內容。"
            : "免費建立帳戶，解鎖文章全文、收藏功能與每日摘要。"
          : isLogin
            ? "Welcome back. Log in to unlock full articles and premium content."
            : "Create a free account to unlock full articles, bookmarks and daily digests."}
      </p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={onGoogle}
        disabled={!!loading}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:hover:bg-ink-800"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
        <span className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">
          {uiLang === "zh" ? "或" : "or"}
        </span>
        <div className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
      </div>

      {/* Email form */}
      <form onSubmit={onEmailSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={!!loading}
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-accent-500 focus:outline-none disabled:opacity-50 dark:border-ink-800 dark:bg-ink-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={uiLang === "zh" ? (isLogin ? "您的密碼" : "至少 6 個字元") : (isLogin ? "Your password" : "At least 6 characters")}
              disabled={!!loading}
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-accent-500 focus:outline-none disabled:opacity-50 dark:border-ink-800 dark:bg-ink-900"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={!!loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-50 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
        >
          {loading === "email" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {uiLang === "zh" ? (isLogin ? "登入" : "註冊") : (isLogin ? "Log in" : "Sign up")}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink-500 dark:text-ink-400">
        {uiLang === "zh" ? (isLogin ? "尚未擁有帳戶？" : "已經擁有帳戶？") : (isLogin ? "No account yet?" : "Already have an account?")}{" "}
        <Link
          href={`/${lang}/${isLogin ? "signup" : "login"}`}
          className="font-semibold text-ink-900 hover:underline dark:text-white"
        >
          {uiLang === "zh" ? (isLogin ? "立即註冊" : "前往登入") : (isLogin ? "Sign up" : "Log in")}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function translateError(msg: string, lang: AuthLang): string {
  if (lang === "en") {
    if (msg.includes("Invalid login credentials")) return "The email or password is incorrect.";
    if (msg.includes("Email not confirmed")) return "Your email has not been verified. Please check your inbox and confirm your account.";
    if (msg.includes("already registered")) return "This email is already registered. Please log in instead.";
    if (msg.includes("Password should be at least")) return "Password must be at least 6 characters.";
    return msg;
  }
  if (msg.includes("Invalid login credentials")) return "電子郵件或密碼不正確。";
  if (msg.includes("Email not confirmed")) return "電子郵件尚未完成驗證，請前往收件箱確認帳戶。";
  if (msg.includes("already registered")) return "此電子郵件已註冊，請改為登入。";
  if (msg.includes("Password should be at least")) return "密碼至少需要 6 個字元。";
  return msg;
}

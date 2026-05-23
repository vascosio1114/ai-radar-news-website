"use client";

import Link from "next/link";

interface LoginPromptProps {
  message?: string;
  returnUrl?: string;
  lang?: "zh" | "en";
}

export function LoginPrompt({ message, returnUrl = "/", lang = "en" }: LoginPromptProps) {
  const text = message ?? (lang === "zh" ? "請先登入" : "Log in to continue");
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-4 text-center dark:border-ink-800/70 dark:bg-ink-900">
      <p className="text-sm text-ink-400">
        {text}.{" "}
        <Link href={`/${lang}/login?next=${encodeURIComponent(returnUrl)}`} className="text-accent-500 hover:underline">
          {lang === "zh" ? "登入" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
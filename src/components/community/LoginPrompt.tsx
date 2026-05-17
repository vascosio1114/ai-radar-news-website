"use client";

import Link from "next/link";

interface LoginPromptProps {
  message?: string;
  returnUrl?: string;
}

export function LoginPrompt({ message = "Login to post", returnUrl = "/" }: LoginPromptProps) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-4 text-center dark:border-ink-800/70 dark:bg-ink-900">
      <p className="text-sm text-ink-400">
        {message}.{" "}
        <Link href={`/login?next=${encodeURIComponent(returnUrl)}`} className="text-accent-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
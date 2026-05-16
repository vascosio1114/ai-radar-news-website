import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

/**
 * Gate component — wrap around content that requires auth.
 *
 * Usage (Server Component):
 *   import { Paywall } from "@/components/auth/Paywall";
 *   import { isLoggedIn } from "@/lib/auth/server";
 *   const loggedIn = await isLoggedIn();
 *   return loggedIn ? <FullContent /> : <Paywall lang={lang} returnUrl="..." />;
 */
export function Paywall({
  lang = "zh",
  title = "登入解鎖全文",
  description = "免費註冊解鎖文章全文、AI 工具詳情同每日 digest。",
  returnUrl,
}: {
  lang?: string;
  title?: string;
  description?: string;
  returnUrl?: string;
}) {
  const nextParam = returnUrl ? `?next=${encodeURIComponent(returnUrl)}` : "";

  return (
    <div className="container-page py-10">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br from-white to-accent-50 p-8 text-center dark:border-ink-800/70 dark:from-ink-900 dark:to-ink-900 md:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400">
            <Lock className="h-5 w-5" />
          </div>

          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 md:text-base">
            {description}
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-ink-600 dark:text-ink-300">
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
              文章全文 + 深度解讀
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
              AI 工具獨家評測同 affiliate 折扣
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
              每日 inbox digest（精選 5 條 AI 動向）
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
              收藏文章 + 個人化推薦
            </li>
          </ul>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${lang}/signup${nextParam}`}
              className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100 sm:w-auto"
            >
              免費註冊解鎖
            </Link>
            <Link
              href={`/${lang}/login${nextParam}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:underline dark:text-ink-200"
            >
              已經有 account？登入
            </Link>
          </div>

          <p className="mt-4 text-xs text-ink-500 dark:text-ink-400">
            免費 · 唔需要信用卡 · 可隨時刪除 account
          </p>
        </div>
      </div>
    </div>
  );
}

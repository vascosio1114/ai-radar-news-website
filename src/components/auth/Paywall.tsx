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
  title,
  description,
  returnUrl,
}: {
  lang?: string;
  title?: string;
  description?: string;
  returnUrl?: string;
}) {
  const uiLang = lang === "en" ? "en" : "zh";
  const nextParam = returnUrl ? `?next=${encodeURIComponent(returnUrl)}` : "";
  const copy = uiLang === "zh"
    ? {
        title: title ?? "登入以解鎖全文",
        description: description ?? "免費註冊即可解鎖文章全文、AI 工具詳情與每日摘要。",
        bullets: ["文章全文與深度解讀", "AI 工具獨家評測與 affiliate 優惠", "每日收件箱摘要（精選 5 條 AI 動態）", "收藏文章與個人化推薦"],
        signup: "免費註冊解鎖",
        login: "已經擁有帳戶？登入",
        note: "免費 · 無需信用卡 · 可隨時刪除帳戶",
      }
    : {
        title: title ?? "Log in to unlock the full article",
        description: description ?? "Create a free account to unlock full articles, AI tool details and daily digests.",
        bullets: ["Full articles and in-depth analysis", "Exclusive AI tool reviews and affiliate offers", "Daily inbox digest with five selected AI updates", "Bookmarks and personalized recommendations"],
        signup: "Create a free account",
        login: "Already have an account? Log in",
        note: "Free · No credit card required · Delete your account anytime",
      };

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
            {copy.title}
          </h2>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 md:text-base">
            {copy.description}
          </p>

          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-ink-600 dark:text-ink-300">
            {copy.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={`/${lang}/signup${nextParam}`}
              className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100 sm:w-auto"
            >
              {copy.signup}
            </Link>
            <Link
              href={`/${lang}/login${nextParam}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 hover:underline dark:text-ink-200"
            >
              {copy.login}
            </Link>
          </div>

          <p className="mt-4 text-xs text-ink-500 dark:text-ink-400">
            {copy.note}
          </p>
        </div>
      </div>
    </div>
  );
}

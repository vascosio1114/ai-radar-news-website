import Link from "next/link";
import type { Lang } from "@/lib/site";

interface UnlockFullArticleCTAProps {
  lang: Lang;
  slug: string;
}

export default function UnlockFullArticleCTA({ lang, slug }: UnlockFullArticleCTAProps) {
  const copy =
    lang === "zh"
      ? {
          title: "登入後閱讀完整文章",
          desc: "免費建立帳戶，即可解鎖完整內容與後續更新。",
          primary: "登入或建立帳戶",
          secondary: "返回文章列表",
          notePrefix: "已經擁有帳戶？",
          signIn: "登入",
          noteSuffix: "即可閱讀完整文章。",
        }
      : {
          title: "Want to read the full article?",
          desc: "Create a free account to unlock the complete content and future updates.",
          primary: "Log in or create account",
          secondary: "Back to articles",
          notePrefix: "Already have an account?",
          signIn: "Sign in",
          noteSuffix: "to access the full article.",
        };

  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-accent-200 bg-accent-50 p-8 dark:border-accent-800 dark:bg-accent-950/20">
      <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
        {copy.title}
      </h3>
      <p className="mt-2 text-ink-600 dark:text-ink-400">
        {copy.desc}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/news/${slug}`)}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          {copy.primary}
        </Link>
        <Link
          href={`/${lang}/news`}
          className="inline-flex items-center gap-2 text-sm text-ink-600 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
        >
          {copy.secondary}
        </Link>
      </div>
      <p className="mt-4 text-xs text-ink-500 dark:text-ink-500">
        {copy.notePrefix}{" "}
        <Link href={`/${lang}/login?next=${encodeURIComponent(`/${lang}/news/${slug}`)}`} className="underline hover:text-accent-600">
          {copy.signIn}
        </Link>{" "}
        {copy.noteSuffix}
      </p>
    </div>
  );
}

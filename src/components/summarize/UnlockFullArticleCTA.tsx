import Link from "next/link";
import type { Lang } from "@/lib/site";

interface UnlockFullArticleCTAProps {
  lang: Lang;
  slug: string;
}

export default function UnlockFullArticleCTA({ lang, slug }: UnlockFullArticleCTAProps) {
  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-accent-200 bg-accent-50 p-8 dark:border-accent-800 dark:bg-accent-950/20">
      <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
        Want to read the full article?
      </h3>
      <p className="mt-2 text-ink-600 dark:text-ink-400">
        Sign up for free to unlock the complete content
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/${lang}/admin/login`}
          className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          Log in / Create account
        </Link>
        <Link
          href={`/${lang}/news`}
          className="inline-flex items-center gap-2 text-sm text-ink-600 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
        >
          Back to articles
        </Link>
      </div>
      <p className="mt-4 text-xs text-ink-500 dark:text-ink-500">
        Already have an account?{" "}
        <Link href={`/${lang}/admin/login`} className="underline hover:text-accent-600">
          Sign in
        </Link>{" "}
        to access all full articles.
      </p>
    </div>
  );
}
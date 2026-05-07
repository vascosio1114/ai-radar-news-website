import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page section-pad text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        搵唔到呢一頁
      </h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
        可能個 link 過時咗，或者個頁仲未起好。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
      >
        返首頁
      </Link>
    </div>
  );
}

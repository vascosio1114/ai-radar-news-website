"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "zh";
  const copy =
    lang === "en"
      ? {
          title: "Page not found",
          desc: "The link may have expired, or this page has not been created yet.",
          cta: "Back to home",
          href: "/en",
        }
      : {
          title: "找不到此頁面",
          desc: "連結可能已過期，或此頁面尚未建立。",
          cta: "返回首頁",
          href: "/zh",
        };

  return (
    <div className="container-page section-pad text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
        {copy.desc}
      </p>
      <Link
        href={copy.href}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
      >
        {copy.cta}
      </Link>
    </div>
  );
}

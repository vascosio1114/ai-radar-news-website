"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Github, Twitter, Mail } from "lucide-react";
import { SITE_NAME, SUPPORTED_LANGS } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const lang = SUPPORTED_LANGS.find((l) => pathname.startsWith(`/${l}`)) ?? "zh";

  const navItems = [
    { href: `/${lang}`, label: lang === "zh" ? "首頁" : "Home" },
    { href: `/${lang}/news`, label: lang === "zh" ? "AI 文章" : "AI Blog" },
    { href: `/${lang}/tools`, label: lang === "zh" ? "AI 工具" : "AI Tools" },
    { href: `/${lang}/tutorials`, label: lang === "zh" ? "教學" : "Tutorials" },
  ] as const;

  return (
    <footer className="relative mt-24 border-t border-ink-200/70 dark:border-ink-800/70">
      {/* Top glow line */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />

      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href={`/${lang}`} className="flex items-center gap-2 font-display">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold">{SITE_NAME}</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500 dark:text-ink-400">
            {lang === "zh"
              ? "最新 AI 文章、AI 工具評測、AI 教學與趨勢分析。繁體中文內容每日更新，協助您掌握 AI 浪潮。"
              : "AI articles, tool reviews, tutorials and trend analysis — updated regularly to help you follow the AI wave."}
          </p>
          <div className="mt-6 flex items-center gap-2">
            <SocialIcon
              href="https://twitter.com"
              label="Twitter"
              icon={<Twitter className="h-4 w-4" />}
            />
            <SocialIcon
              href="https://github.com"
              label="GitHub"
              icon={<Github className="h-4 w-4" />}
            />
            <SocialIcon
              href="mailto:hello@example.com"
              label="Email"
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Site map */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            {lang === "zh" ? "導覽" : "Navigation"}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            {lang === "zh" ? "資源" : "Resources"}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/about"
                className="text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
              >
                {lang === "zh" ? "關於我們" : "About"}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
              >
                {lang === "zh" ? "聯絡" : "Contact"}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
              >
                {lang === "zh" ? "私隱政策" : "Privacy Policy"}
              </Link>
            </li>
            <li>
              <Link
                href="/rss.xml"
                className="text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
              >
                RSS
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-200/70 dark:border-ink-800/70">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-500 dark:text-ink-400 md:flex-row">
          <p>© {year} {SITE_NAME}. All rights reserved.</p>
          <p>{lang === "zh" ? "使用 Next.js 與 Supabase 建立" : "Built with Next.js and Supabase"}</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200 dark:hover:text-accent-400"
    >
      {icon}
    </a>
  );
}

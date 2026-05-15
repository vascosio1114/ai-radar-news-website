"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { SITE_NAME, SUPPORTED_LANGS } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Detect lang from pathname (e.g. "/zh/news" -> "zh")
  const lang = SUPPORTED_LANGS.find((l) => pathname.startsWith(`/${l}`)) ?? "zh";

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on route change
  React.useEffect(() => setOpen(false), [pathname]);

  const navItems = [
    { href: `/${lang}`, label: lang === "zh" ? "首頁" : "Home" },
    { href: `/${lang}/dashboard`, label: lang === "zh" ? "今日動態" : "Dashboard" },
    { href: `/${lang}/news`, label: lang === "zh" ? "AI 新聞" : "AI News" },
    { href: `/${lang}/tools`, label: lang === "zh" ? "AI 工具" : "AI Tools" },
    { href: `/${lang}/tutorials`, label: lang === "zh" ? "教學" : "Tutorials" },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-ink-200/60 dark:border-ink-800/60"
          : "border-b border-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href={`/${lang}`} className="flex items-center gap-2 font-display">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {SITE_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${lang}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-ink-900 dark:text-white"
                    : "text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            aria-label="開啟選單"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden">
          <nav className="container-page flex flex-col gap-1 pb-4">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== `/${lang}` && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-white"
                      : "text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

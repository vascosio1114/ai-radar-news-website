"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { UserButton } from "@/components/auth/UserButton";
import { cn } from "@/lib/utils";
import { getLangNavItems, SITE_NAME, SUPPORTED_LANGS } from "@/lib/site";

type Props = {
  initialUser: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function NavbarClient({ initialUser }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const lang = SUPPORTED_LANGS.find((item) => pathname.startsWith(`/${item}`)) ?? "zh";
  const navItems = [
    ...getLangNavItems(lang),
    { href: `/${lang}/community`, label: lang === "zh" ? "社群" : "Community" },
  ] as const;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setOpen(false), [pathname]);

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
        <Link href={`/${lang}`} className="flex items-center gap-2 font-display">
          <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
            <Image
              src="/images/airadarstudio_logo.jpg"
              alt={`${SITE_NAME} logo`}
              fill
              sizes="32px"
              className="object-cover"
              priority
            />
          </span>
          <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>

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
                {active ? (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden md:block">
            <UserButton initialUser={initialUser} />
          </div>
          <button
            type="button"
            aria-label={lang === "zh" ? "開啟選單" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
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
            <div className="mt-2 border-t border-ink-200/70 pt-3 dark:border-ink-800/70">
              <UserButton initialUser={initialUser} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

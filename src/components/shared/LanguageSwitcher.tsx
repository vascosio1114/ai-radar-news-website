"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { LANG_COOKIE, DEFAULT_LANG } from "@/lib/i18n";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function detectLang(pathname: string): "zh" | "en" {
  if (pathname.startsWith("/zh") || pathname.startsWith("/zh/")) return "zh";
  if (pathname.startsWith("/en") || pathname.startsWith("/en/")) return "en";
  return DEFAULT_LANG;
}

function switchPath(pathname: string, toLang: "zh" | "en"): string {
  const zhMatch = pathname.match(/^\/zh(\/.*)?$/);
  const enMatch = pathname.match(/^\/en(\/.*)?$/);

  if (zhMatch) {
    // /zh/news -> /en/news, /zh -> /en
    return toLang === "en" ? `/en${zhMatch[1] ?? ""}` : pathname;
  }
  if (enMatch) {
    // /en/news -> /zh/news, /en -> /zh
    return toLang === "zh" ? `/zh${enMatch[1] ?? ""}` : pathname;
  }
  // No lang prefix: prepend the target lang
  // e.g. / -> /zh or / -> /en
  return `/${toLang}${pathname === "/" ? "" : pathname}`;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const currentLang = mounted ? detectLang(pathname) : DEFAULT_LANG;
  const targetLang = currentLang === "zh" ? "en" : "zh";

  const handleSwitch = React.useCallback(() => {
    setCookie(LANG_COOKIE, targetLang);
    const newPath = switchPath(pathname, targetLang);
    router.push(newPath);
  }, [pathname, targetLang, router]);

  // Accessible label for the target language
  const targetLabel = targetLang === "zh" ? "中" : "EN";
  const tooltip = targetLang === "zh" ? "Switch to Chinese" : "Switch to English";

  return (
    <button
      type="button"
      aria-label={tooltip}
      title={tooltip}
      onClick={handleSwitch}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200 dark:hover:text-accent-400"
    >
      {mounted ? (
        targetLang === "zh" ? (
          // Show "中" for zh; use Globe as fallback visual
          <span className="font-medium text-xs leading-none">中</span>
        ) : (
          <Globe className="h-4 w-4" />
        )
      ) : (
        // Placeholder to avoid layout shift during hydration
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

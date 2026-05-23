"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const lang = pathname.startsWith("/en") ? "en" : "zh";

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <button
      type="button"
      aria-label={lang === "zh" ? "切換深淺主題" : "Toggle theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-ink-700 transition hover:border-accent-400 hover:text-accent-600 dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200 dark:hover:text-accent-400"
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

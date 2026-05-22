"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SUPPORTED_LANGS } from "@/lib/site";

type Props = {
  initialUser: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function UserButton({ initialUser }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const lang = SUPPORTED_LANGS.find((l) => pathname.startsWith(`/${l}`)) ?? "zh";

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  async function onLogout() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push(`/${lang}`);
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  // 未登入 → 顯示 Login / Signup
  if (!initialUser) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href={`/${lang}/login?next=${encodeURIComponent(pathname)}`}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
        >
          登入
        </Link>
        <Link
          href={`/${lang}/signup`}
          className="rounded-full bg-ink-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
        >
          註冊
        </Link>
      </div>
    );
  }

  // 已登入 → avatar + dropdown
  const initial = (initialUser.display_name ?? initialUser.email)
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-sm font-bold text-ink-700 transition hover:border-accent-400 dark:border-ink-800 dark:bg-ink-900/70 dark:text-ink-200"
        aria-label="User menu"
      >
        {initialUser.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initialUser.avatar_url}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-soft dark:border-ink-800/70 dark:bg-ink-900">
          <div className="border-b border-ink-200/70 px-4 py-3 dark:border-ink-800/70">
            <div className="truncate text-sm font-semibold">
              {initialUser.display_name ?? initialUser.email.split("@")[0]}
            </div>
            <div className="truncate text-xs text-ink-500 dark:text-ink-400">
              {initialUser.email}
            </div>
          </div>
          <div className="py-1">
            <Link
              href={`/${lang}/account`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50 dark:hover:bg-ink-800"
            >
              <UserIcon className="h-4 w-4" />
              我嘅 Account
            </Link>
            <Link
              href={`/${lang}/account/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-50 dark:hover:bg-ink-800"
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
          </div>
          <div className="border-t border-ink-200/70 py-1 dark:border-ink-800/70">
            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              登出
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

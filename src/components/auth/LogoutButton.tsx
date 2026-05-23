"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton({ lang = "zh" }: { lang?: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push(`/${lang}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-300"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {lang === "zh" ? "登出" : "Log out"}
    </button>
  );
}

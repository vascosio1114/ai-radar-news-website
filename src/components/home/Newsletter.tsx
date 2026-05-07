"use client";

import * as React from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setState("error");
      setMessage("唔該輸入有效嘅 email");
      return;
    }
    setState("loading");
    try {
      // TODO: 之後接通 /api/newsletter route handler
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("success");
      setMessage("訂閱成功！記得 check 你個 inbox 確認。");
      setEmail("");
    } catch {
      setState("error");
      setMessage("訂閱失敗，請稍後再試。");
    }
  }

  return (
    <section className="container-page section-pad">
      <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-gradient-to-br from-white to-accent-50 p-8 dark:border-ink-800/70 dark:from-ink-900 dark:to-ink-900 md:p-12">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-3 py-1 text-xs font-semibold text-ink-700 backdrop-blur dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-200">
              <Mail className="h-3.5 w-3.5" />
              每週通訊
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              每週直送你 inbox 嘅 AI 精華
            </h2>
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 md:text-base">
              我哋每星期幫你濃縮整週最緊要嘅 AI 動向、新工具同實用 prompt。免費，可隨時退訂。
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3"
            noValidate
          >
            <div className="glass flex items-center gap-2 rounded-2xl p-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none dark:placeholder:text-ink-500"
                disabled={state === "loading" || state === "success"}
              />
              <button
                type="submit"
                disabled={state === "loading" || state === "success"}
                className="inline-flex items-center gap-1 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
              >
                {state === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {state === "success" ? "已訂閱" : "訂閱"}
              </button>
            </div>
            {message && (
              <p
                className={`text-xs ${
                  state === "error"
                    ? "text-rose-500"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {message}
              </p>
            )}
            <p className="text-xs text-ink-500 dark:text-ink-400">
              我哋唔會 spam，亦唔會將你嘅 email 賣俾人。
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

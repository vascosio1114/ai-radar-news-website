"use client";

import * as React from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { getUIStrings, type Lang } from "@/lib/i18n";

export function Newsletter({ lang = "zh" }: { lang?: Lang }) {
  const s = getUIStrings(lang);
  const [email, setEmail] = React.useState("");
  const [dailyOptIn, setDailyOptIn] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setState("error");
      setMessage(s.newsletterEmailError);
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, daily_opt_in: dailyOptIn }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setState("success");
      setMessage(s.newsletterSuccessMsg);
      setEmail("");
      setDailyOptIn(false);
    } catch {
      setState("error");
      setMessage(s.newsletterErrorMsg);
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
              {s.newsletter}
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {s.newsletterTitle}
            </h2>
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 md:text-base">
              {s.newsletterDesc}
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
                placeholder={s.newsletterPlaceholder}
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
                {state === "success" ? s.newsletterSuccess : s.newsletterButton}
              </button>
            </div>

            {/* Daily digest opt-in checkbox */}
            <div className="flex items-start gap-2 px-1">
              <input
                type="checkbox"
                id="daily_opt_in"
                checked={dailyOptIn}
                onChange={(e) => setDailyOptIn(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-ink-300"
                disabled={state === "loading" || state === "success"}
              />
              <label
                htmlFor="daily_opt_in"
                className="text-sm text-ink-600 dark:text-ink-300"
              >
                {s.newsletterDailyDigestOptIn}
              </label>
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
              {s.newsletterNoSpam}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
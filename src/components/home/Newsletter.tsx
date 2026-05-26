"use client";

import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { Envelope, EnvelopeSimple } from "@phosphor-icons/react";
import { getUIStrings, type Lang } from "@/lib/i18n";

const SPRING_OVERSHOOT = { type: "spring" as const, stiffness: 400, damping: 25 };

interface NewsletterProps {
  lang?: Lang;
}

export function Newsletter({ lang = "zh" }: NewsletterProps) {
  const s = getUIStrings(lang);
  const [email, setEmail] = React.useState("");
  const [dailyOptIn, setDailyOptIn] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(s.newsletterEmailError);
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, daily_opt_in: dailyOptIn }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setStatus("success");
      setMessage(s.newsletterSuccessMsg);
      setEmail("");
      setDailyOptIn(false);
    } catch {
      setStatus("error");
      setMessage(s.newsletterErrorMsg);
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (status === "error") setStatus("idle");
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
              <Envelope className="h-3.5 w-3.5" />
              {s.newsletter}
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {s.newsletterTitle}
            </h2>
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-300 md:text-base">
              {s.newsletterDesc}
            </p>
          </div>

          {/* Form / Success Container */}
          <div className="relative min-h-[120px]">
            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={onSubmit}
                  className="flex flex-col gap-3"
                  noValidate
                >
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="glass flex items-center gap-2 rounded-2xl p-2"
                  >
                    <EnvelopeSimple className="ml-3 h-4 w-4 shrink-0 text-ink-400" />
                    <input
                      type="email"
                      required
                      placeholder={s.newsletterPlaceholder}
                      value={email}
                      onChange={handleEmailChange}
                      disabled={status === "loading"}
                      className={`min-w-0 flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none dark:placeholder:text-ink-500 ${
                        status === "error"
                          ? "border-rose-500 dark:border-rose-500"
                          : "border-transparent"
                      }`}
                    />
                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.25, ...SPRING_OVERSHOOT }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60 dark:bg-white dark:text-ink-900 dark:hover:bg-ink-100"
                    >
                      {status === "loading" ? (
                        <LoadingDots />
                      ) : (
                        <span>{s.newsletterButton}</span>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Daily digest opt-in */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.33, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-2 px-1"
                  >
                    <input
                      type="checkbox"
                      id="daily_opt_in"
                      checked={dailyOptIn}
                      onChange={(e) => setDailyOptIn(e.target.checked)}
                      disabled={status === "loading"}
                      className="mt-1 h-4 w-4 rounded border-ink-300"
                    />
                    <label htmlFor="daily_opt_in" className="text-sm text-ink-600 dark:text-ink-300">
                      {s.newsletterDailyDigestOptIn}
                    </label>
                  </motion.div>

                  {/* Error message */}
                  <AnimatePresence>
                    {status === "error" && message && (
                      <motion.p
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-rose-500"
                      >
                        {message}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="text-xs text-ink-500 dark:text-ink-400">{s.newsletterNoSpam}</p>
                </motion.form>
              ) : (
                <SuccessState key="success" message={s.newsletterSuccessMsg} /> // success message
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoadingDots() {
  const dots = useMotionValue(0);
  const opacity = useTransform(dots, [0, 1, 2], [0.3, 1, 0.3]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      animate(dots, dots.get() + 1, { duration: 0.4, ease: "linear" });
    }, 400);
    return () => clearInterval(interval);
  }, [dots]);

  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ opacity }}
          className="h-1 w-1 rounded-full bg-current"
        />
      ))}
    </span>
  );
}

function SuccessState({ message }: { message: string }) {
  const [showText, setShowText] = React.useState(false);

  // Circle animation values
  const circleProgress = useMotionValue(1);
  const circleOffset = useTransform(circleProgress, [0, 1], [0, 1]);

  // Check path animation values
  const checkProgress = useMotionValue(0);
  const checkOffset = useTransform(checkProgress, [0, 1], [0, 1]);

  React.useEffect(() => {
    // Animate circle drawing
    const circleTimeline = animate(circleProgress, 0, {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    });

    // Animate check mark with delay
    const checkTimeline = animate(checkProgress, 0, {
      duration: 0.3,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1],
    });

    // Show text after animations
    const textTimer = setTimeout(() => setShowText(true), 600);

    return () => {
      circleTimeline.stop();
      checkTimeline.stop();
      clearTimeout(textTimer);
    };
  }, [circleProgress, checkProgress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ...SPRING_OVERSHOOT }}
        className="relative"
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-accent-500">
          {/* Background circle */}
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 175.93,
              strokeDashoffset: 175.93 * circleOffset.get(),
            }}
          />
          {/* Check mark path */}
          <motion.path
            d="M20 33 L28 41 L44 23"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: 50 * (1 - checkOffset.get()),
            }}
          />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm font-semibold text-ink-700 dark:text-ink-200"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Wrench, GraduationCap, Eye, PenLine, ArrowRight, Home, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    articles: 0,
    tools: 0,
    tutorials: 0,
    views: 0,
    users: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setStats({
            articles: data.articles ?? 0,
            tools: data.tools ?? 0,
            tutorials: data.tutorials ?? 0,
            views: data.views ?? 0,
            users: data.users ?? 0,
          });
        }
      });
  }, []);

  const statsDisplay = [
    { label: "文章總數", value: stats.articles.toString(), icon: Newspaper },
    { label: "工具總數", value: stats.tools.toString(), icon: Wrench },
    { label: "教學總數", value: stats.tutorials.toString(), icon: GraduationCap },
    { label: "本月瀏覽", value: stats.views > 0 ? stats.views.toLocaleString() : "—", icon: Eye },
    { label: "Users", value: stats.users.toString(), icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        歡迎回來。此處顯示網站的整體狀態。
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Link
          href="/admin/articles/new"
          className="group relative overflow-hidden rounded-3xl border border-accent-500/25 bg-gradient-to-br from-ink-950 via-ink-900 to-black p-6 text-white shadow-glow transition hover:-translate-y-0.5 hover:border-accent-400/50"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-12 rounded-full bg-accent-500/20 blur-3xl transition group-hover:bg-accent-400/25" />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-accent-300 ring-1 ring-white/10">
                <PenLine className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-300/80">
                Blog Composer
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                寫新 Blog 文章
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                手寫 AI 觀點、教學、分析或者工具文章。發佈後會即刻連到主頁最新文章區。
              </p>
            </div>
            <ArrowRight className="mt-2 h-5 w-5 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </Link>

        <Link
          href="/zh"
          target="_blank"
          className="group rounded-3xl border border-ink-200 bg-white/80 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-accent-400/50 dark:border-ink-800 dark:bg-ink-950/70"
        >
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
            <Home className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500 dark:text-ink-400">
            Public Site
          </p>
          <h2 className="mt-3 font-display text-xl font-bold tracking-tight">
            查看主頁
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-400">
            檢查新文章在主頁與 Blog 列表中的呈現。
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-ink-400 dark:text-ink-500" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

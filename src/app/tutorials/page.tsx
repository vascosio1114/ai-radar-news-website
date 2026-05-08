import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AI 教學",
  description: "由新手到進階嘅 AI 教學文章。",
};

const LEVEL_STYLE: Record<string, string> = {
  新手: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  中級: "bg-accent-500/10 text-accent-700 dark:text-accent-400",
  進階: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default async function TutorialsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("tutorials")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const tutorials = data ?? [];

  return (
    <div className="container-page section-pad">
      <header className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Tutorials
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          AI 教學
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          一步步教你由零開始用 AI。免費、繁體中文、有實作。
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {tutorials.map((t) => (
          <Link
            key={t.id}
            href={`/tutorials/${t.slug}`}
            className="card-hover group relative flex overflow-hidden rounded-3xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
          >
            <div className="relative aspect-square w-40 shrink-0 overflow-hidden md:w-56">
              <Image
                src={t.cover_image}
                alt={t.title}
                fill
                sizes="(min-width: 768px) 220px, 160px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-semibold ${LEVEL_STYLE[t.level] ?? ""}`}
                >
                  <GraduationCap className="mr-1 inline h-3 w-3" />
                  {t.level}
                </span>
                <span className="inline-flex items-center gap-1 text-ink-500 dark:text-ink-400">
                  <Clock className="h-3.5 w-3.5" />
                  {t.duration}
                </span>
              </div>
              <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">
                {t.title}
              </h3>
              <p className="line-clamp-3 text-sm text-ink-500 dark:text-ink-400">
                {t.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

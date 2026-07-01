import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocalizedContent, getUIStrings, hasEnglishDisplayContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG, SITE_URL } from "@/lib/site";

type Props = { params: { lang: string } };

const LEVEL_STYLE = {
  beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-accent-500/10 text-accent-700 dark:text-accent-400",
  advanced: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
} as const;

export function generateMetadata({ params }: Props): Metadata {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const title = lang === "zh" ? "AI 教學" : "AI Tutorials";
  const description =
    lang === "zh"
      ? "一步步學習 AI 工具、prompt、工作流程與實戰應用，適合創作者、營運人員與專業人士。"
      : "Step-by-step AI tutorials covering tools, prompts, workflows, and practical use cases.";
  const path = `/${lang}/tutorials`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        "zh-Hant": `${SITE_URL}/zh/tutorials`,
        en: `${SITE_URL}/en/tutorials`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}${path}` },
  };
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function levelKey(level: string): keyof typeof LEVEL_STYLE {
  const value = (level ?? "").toLowerCase();
  if (value.includes("advanced") || value.includes("高階")) return "advanced";
  if (value.includes("intermediate") || value.includes("進階")) return "intermediate";
  return "beginner";
}

function levelLabel(level: string, lang: Lang) {
  const key = levelKey(level);
  if (lang === "en") {
    if (key === "advanced") return "Advanced";
    if (key === "intermediate") return "Intermediate";
    return "Beginner";
  }
  if (key === "advanced") return "高階";
  if (key === "intermediate") return "進階";
  return "入門";
}

function durationLabel(duration: string, lang: Lang) {
  if (!duration) return lang === "zh" ? "閱讀時間待定" : "Duration TBC";
  if (lang !== "en") return duration;
  return duration.replace(/分鐘/g, "min").replace(/小時/g, "hr").replace(/日/g, "days");
}

export default async function TutorialsPage({ params }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const data = hasSupabaseConfig()
    ? (
        await createSupabaseServerClient()
          .from("tutorials")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
      ).data
    : [];

  const tutorials =
    lang === "en"
      ? (data ?? []).filter((tutorial) => hasEnglishDisplayContent(tutorial, ["title", "excerpt"]))
      : data ?? [];

  return (
    <div className="container-page section-pad">
      <header className="mb-12 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Tutorials
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {s.tutorialsPageTitle}
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {s.tutorialsPageDesc}
        </p>
      </header>

      {tutorials.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {tutorials.map((t) => {
            const localized = getLocalizedContent(t, lang);
            const key = levelKey(t.level);
            return (
              <Link
                key={t.id}
                href={`/${lang}/tutorials/${t.slug}`}
                className="card-hover group relative flex overflow-hidden rounded-lg border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
              >
                <div className="relative aspect-square w-40 shrink-0 overflow-hidden md:w-56">
                  <Image
                    src={t.cover_image}
                    alt={localized.title}
                    fill
                    sizes="(min-width: 768px) 220px, 160px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${LEVEL_STYLE[key]}`}>
                      <GraduationCap className="mr-1 inline h-3 w-3" />
                      {levelLabel(t.level, lang)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-500 dark:text-ink-400">
                      <Clock className="h-3.5 w-3.5" />
                      {durationLabel(t.duration, lang)}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">
                    {localized.title}
                  </h3>
                  <p className="line-clamp-3 text-sm text-ink-500 dark:text-ink-400">
                    {localized.excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-ink-200/70 bg-white p-8 text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-400">
          {lang === "zh" ? "暫時未有教學內容，請稍後再回來查看。" : "No English tutorials are available yet."}
        </div>
      )}
    </div>
  );
}

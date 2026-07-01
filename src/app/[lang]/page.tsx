import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getJobImpactTrend,
  getActiveSources,
  getPublicStats,
  type JobImpactTrend,
} from "@/lib/dashboard/queries";
import { JobImpactTicker } from "@/components/dashboard/JobImpactTicker";
import { AISnowSection } from "@/components/home/AISnowSection";
import { ProtocolExperience } from "@/components/home/ProtocolExperience";
import { type Lang } from "@/lib/site";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

type Props = { params: { lang: string } };

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function fallbackJobImpactTrend(): JobImpactTrend {
  const points = [
    { day: "2026-01", signal_count: 61, estimated_affected_roles: 289_000_000, index: 282 },
    { day: "2026-02", signal_count: 62, estimated_affected_roles: 292_000_000, index: 285 },
    { day: "2026-03", signal_count: 64, estimated_affected_roles: 296_000_000, index: 289 },
    { day: "2026-04", signal_count: 65, estimated_affected_roles: 299_000_000, index: 292 },
    { day: "2026-05", signal_count: 66, estimated_affected_roles: 302_000_000, index: 294 },
  ];

  return {
    points,
    latest: points[points.length - 1],
    previous: points[points.length - 2],
    change_pct: 1,
    total_signal_count: points.reduce((sum, point) => sum + point.signal_count, 0),
    total_estimated_affected_roles: points[points.length - 1].estimated_affected_roles,
  };
}

export default async function HomePage({ params }: Props) {
  const lang = params.lang as Lang;
  if (!hasSupabaseConfig()) {
    return (
      <>
        <Hero lang={lang} stats={{ articles: 300, tools: 120 }} />
        <div className="relative space-y-0 bg-white pb-8 dark:bg-black">
          <LatestNews articles={[]} lang={lang} featuredOnly />
          <JobImpactTicker trend={fallbackJobImpactTrend()} lang={lang} />
          <ProtocolExperience lang={lang} sources={[]} />
          <Newsletter lang={lang} />
        </div>
      </>
    );
  }

  const supabase = createSupabaseServerClient();

  const [latestResult, jobImpact, activeSources, publicStats] = await Promise.all([
    // Use articles_public to respect auth gating - unauthenticated only see summary_content
    supabase
      .from("articles_public")
      .select("*")
      .not(lang === "zh" ? "title_zh" : "title_en", "is", null)
      .order("published_at", { ascending: false })
      .limit(1),
    getJobImpactTrend(),
    getActiveSources(),
    getPublicStats(),
  ]);

  const latest = latestResult.data ?? [];

  return (
    <>
      <Hero lang={lang} stats={publicStats} />
      <div className="relative space-y-0 bg-white pb-8 dark:bg-black">
        <LatestNews articles={latest} lang={lang} featuredOnly />
        <JobImpactTicker trend={jobImpact} lang={lang} />
        <ProtocolExperience lang={lang} sources={activeSources} />
        <Newsletter lang={lang} />
      </div>
    </>
  );
}

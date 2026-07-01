import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJobImpactTrend, getActiveSources, getPublicStats } from "@/lib/dashboard/queries";
import { JobImpactTicker } from "@/components/dashboard/JobImpactTicker";
import { AISnowSection } from "@/components/home/AISnowSection";
import { ProtocolExperience } from "@/components/home/ProtocolExperience";
import { type Lang } from "@/lib/site";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

type Props = { params: { lang: string } };

export default async function HomePage({ params }: Props) {
  const lang = params.lang as Lang;
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

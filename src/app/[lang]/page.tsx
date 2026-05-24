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
      <div className="relative -mt-32 space-y-0 bg-gradient-to-b from-black via-black/80 to-transparent pb-8 md:-mt-44">
        <ScrollReveal>
          <LatestNews articles={latest} lang={lang} featuredOnly />
        </ScrollReveal>
        <ScrollReveal delay={0.03}>
          <JobImpactTicker trend={jobImpact} lang={lang} />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <ProtocolExperience lang={lang} sources={activeSources} />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <Newsletter lang={lang} />
        </ScrollReveal>
      </div>
    </>
  );
}

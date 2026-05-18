import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJobImpactTrend } from "@/lib/dashboard/queries";
import { JobImpactTicker } from "@/components/dashboard/JobImpactTicker";
import { AISnowSection } from "@/components/home/AISnowSection";
import { ProtocolExperience } from "@/components/home/ProtocolExperience";
import { type Lang } from "@/lib/site";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

type Props = { params: { lang: string } };

export default async function HomePage({ params }: Props) {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();

  const [latestResult, jobImpact] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(6),
    getJobImpactTrend(),
  ]);

  const latest = latestResult.data ?? [];

  return (
    <>
      <Hero lang={lang} />
      <div className="relative -mt-32 space-y-0 bg-gradient-to-b from-black via-black/80 to-transparent pb-8 md:-mt-44">
        <ScrollReveal>
          <ProtocolExperience lang={lang} />
        </ScrollReveal>
        <ScrollReveal delay={0.03}>
          <JobImpactTicker trend={jobImpact} />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <AISnowSection />
        </ScrollReveal>
        <ScrollReveal delay={0.06}>
          <LatestNews articles={latest} lang={lang} />
        </ScrollReveal>
        <ScrollReveal delay={0.08}>
          <Newsletter lang={lang} />
        </ScrollReveal>
      </div>
    </>
  );
}

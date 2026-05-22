import { Hero } from "@/components/home/Hero";
import { LatestNews } from "@/components/home/LatestNews";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getJobImpactTrend } from "@/lib/dashboard/queries";
import { JobImpactTicker } from "@/components/dashboard/JobImpactTicker";
import { AISnowSection } from "@/components/home/AISnowSection";
import { type Lang } from "@/lib/site";

type Props = { params: { lang: string } };

export default async function HomePage({ params }: Props) {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();

  const [latestResult, jobImpact] = await Promise.all([
    // Use articles_public to respect auth gating - unauthenticated only see summary_content
    supabase
      .from("articles_public")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(6),
    getJobImpactTrend(),
  ]);

  const latest = latestResult.data ?? [];

  return (
    <>
      <Hero lang={lang} />
      <JobImpactTicker trend={jobImpact} />
      <AISnowSection />
      <LatestNews articles={latest} lang={lang} />
      <Newsletter lang={lang} />
    </>
  );
}

import { Hero } from "@/components/home/Hero";
import { TrendingNews } from "@/components/home/TrendingNews";
import { LatestNews } from "@/components/home/LatestNews";
import { TrendingTools } from "@/components/home/TrendingTools";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type Lang } from "@/lib/site";

type Props = { params: { lang: string } };

export default async function HomePage({ params }: Props) {
  const lang = params.lang as Lang;
  const supabase = createSupabaseServerClient();

  const [featuredResult, latestResult, trendingResult] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("is_featured", true)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("tools")
      .select("*")
      .eq("is_trending", true)
      .limit(4),
  ]);

  const featured = featuredResult.data ?? [];
  const latest = latestResult.data ?? [];
  const trendingTools = trendingResult.data ?? [];

  return (
    <>
      <Hero lang={lang} />
      <TrendingNews articles={featured} lang={lang} />
      <LatestNews articles={latest} lang={lang} />
      <TrendingTools tools={trendingTools} lang={lang} />
      <Newsletter lang={lang} />
    </>
  );
}

import { Hero } from "@/components/home/Hero";
import { TrendingNews } from "@/components/home/TrendingNews";
import { LatestNews } from "@/components/home/LatestNews";
import { TrendingTools } from "@/components/home/TrendingTools";
import { Newsletter } from "@/components/home/Newsletter";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const [featuredResult, latestResult, trendingResult] = await Promise.all([
    supabase
      .from("articles")
      .select("id,slug,title,excerpt,cover_image,category,tags,author,published_at,reading_time,views,is_featured")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("articles")
      .select("id,slug,title,excerpt,cover_image,category,tags,author,published_at,reading_time,views,is_featured")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(6),
    supabase
      .from("tools")
      .select("id,slug,name,tagline,description,logo,website,category,rating,pricing,is_trending")
      .eq("is_trending", true)
      .limit(4),
  ]);

  const featured = featuredResult.data ?? [];
  const latest = latestResult.data ?? [];
  const trendingTools = trendingResult.data ?? [];

  return (
    <>
      <Hero />
      <TrendingNews articles={featured} />
      <LatestNews articles={latest} />
      <TrendingTools tools={trendingTools} />
      <Newsletter />
    </>
  );
}

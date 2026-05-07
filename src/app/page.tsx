import { Hero } from "@/components/home/Hero";
import { TrendingNews } from "@/components/home/TrendingNews";
import { LatestNews } from "@/components/home/LatestNews";
import { TrendingTools } from "@/components/home/TrendingTools";
import { Newsletter } from "@/components/home/Newsletter";
import { MOCK_ARTICLES, MOCK_TOOLS } from "@/data/mock";

export default function HomePage() {
  // 之後改用 Supabase server client 取代 mock：
  // const supabase = createSupabaseServerClient();
  // const { data: featured } = await supabase.from('articles')...
  const featured = MOCK_ARTICLES.filter((a) => a.is_featured).slice(0, 4);
  const latest = MOCK_ARTICLES.slice(0, 6);
  const trendingTools = MOCK_TOOLS.filter((t) => t.is_trending).slice(0, 4);

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

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();

  const staticPaths = ["", "/news", "/tools", "/tutorials", "/trends"].map(
    (p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : 0.8,
    })
  );

  const { data: articles } = await supabase
    .from("articles_public")
    .select("slug, updated_at")
    .eq("is_published", true);

  const articlePaths = (articles ?? []).map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPaths, ...articlePaths];
}
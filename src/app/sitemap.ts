import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();

  const pagePaths = [
    "",
    "/news",
    "/tools",
    "/tutorials",
    "/resources",
    "/about",
    "/contact",
    "/privacy",
  ];

  const staticPaths = ["zh", "en"].flatMap((lang) =>
    pagePaths.map((p) => ({
      url: `${SITE_URL}/${lang}${p}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : 0.8,
    }))
  );

  const { data: articles } = await supabase
    .from("articles_public")
    .select("slug, updated_at")
    .eq("is_published", true);

  const articlePaths = (articles ?? []).flatMap((a) => ["zh", "en"].map((lang) => ({
    url: `${SITE_URL}/${lang}/news/${a.slug}`,
    lastModified: new Date(a.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  })));

  return [...staticPaths, ...articlePaths];
}

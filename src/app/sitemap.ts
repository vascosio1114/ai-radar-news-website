import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    pagePaths.map((path) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "daily" as const : "weekly" as const,
      priority: path === "" ? 1 : path === "/news" || path === "/tools" ? 0.9 : 0.8,
    }))
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return staticPaths;
  }

  const supabase = createSupabaseServerClient();
  const { data: articles } = await supabase
    .from("articles_public")
    .select("slug, updated_at")
    .eq("is_published", true);

  const articlePaths = (articles ?? []).flatMap((article) =>
    ["zh", "en"].map((lang) => ({
      url: `${SITE_URL}/${lang}/summarize/${article.slug}`,
      lastModified: new Date(article.updated_at ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPaths, ...articlePaths];
}

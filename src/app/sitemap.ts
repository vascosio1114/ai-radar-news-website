import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { MOCK_ARTICLES } from "@/data/mock";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/news", "/tools", "/tutorials", "/trends"].map(
    (p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: p === "" ? 1 : 0.8,
    })
  );

  const articlePaths = MOCK_ARTICLES.map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPaths, ...articlePaths];
}

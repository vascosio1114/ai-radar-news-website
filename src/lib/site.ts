export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Radar AI Studio";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.radaraistudio.com";
export const SITE_DESCRIPTION =
  "Radar AI Studio publishes AI news, AI tool directories, tutorials, resources, and trend analysis for builders, creators, operators, and professionals who want to understand artificial intelligence.";
export const SITE_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "airadar.team@gmail.com";

export const SUPPORTED_LANGS = ["zh", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = "zh";

export function getLangNavItems(lang: Lang) {
  return [
    { href: `/${lang}`, label: lang === "zh" ? "首頁" : "Home" },
    { href: `/${lang}/news`, label: lang === "zh" ? "AI 文章" : "AI Blog" },
    { href: `/${lang}/tools`, label: lang === "zh" ? "AI 工具" : "AI Tools" },
    { href: `/${lang}/tutorials`, label: lang === "zh" ? "教學" : "Tutorials" },
    { href: `/${lang}/resources`, label: lang === "zh" ? "資源" : "Resources" },
  ] as const;
}

export const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/news", label: "AI 文章" },
  { href: "/tools", label: "AI 工具" },
  { href: "/tutorials", label: "教學" },
  { href: "/resources", label: "資源" },
  { href: "/trends", label: "趨勢" },
] as const;

export const TOOL_CATEGORIES = [
  { slug: "all", label: "全部" },
  { slug: "video", label: "AI Video" },
  { slug: "image", label: "AI Image" },
  { slug: "coding", label: "AI Coding" },
  { slug: "writing", label: "AI Writing" },
  { slug: "productivity", label: "AI Productivity" },
] as const;

export type ToolCategorySlug = (typeof TOOL_CATEGORIES)[number]["slug"];

import type { Lang } from "@/lib/site";
export type { Lang } from "@/lib/site";

export const LANG_COOKIE = "preferred_lang";
export const DEFAULT_LANG: Lang = "zh";
export const SUPPORTED_LANGS = ["zh", "en"] as const;

export function getLocalizedContent<T extends Record<string, any>>(
  item: T,
  lang: Lang
): T {
  if (lang === "zh") {
    return {
      ...item,
      title: item.title_zh ?? item.title,
      excerpt: item.excerpt_zh ?? item.excerpt,
      content: item.content_zh ?? item.content,
    };
  }
  // en: use content (markdown) — content_html is optional pre-rendered cache
  return item;
}

export const UI_STRINGS = {
  zh: {
    latestNews: "最新更新",
    latestNewsTitle: "最新AI資訊",
    latestNewsDesc: "持續更新，精選值得深入閱讀的 AI 分析文章。",

    trendingNews: "今日熱門",
    trendingNewsTitle: "今日 AI 熱門",
    trendingNewsDesc: "由編輯精選最值得關注的 AI 動態。",

    trendingTools: "熱門工具",
    trendingToolsTitle: "Trending AI Tools",
    trendingToolsDesc: "每週由編輯實測，精選真正具實用價值的 AI 工具。",

    newsletter: "每週通訊",
    newsletterTitle: "每週將 AI 精華送到您的收件箱",
    newsletterDesc:
      "我們每週整理最重要的 AI 動態、新工具與實用 prompt。免費訂閱，並可隨時取消。",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "訂閱",
    newsletterSuccess: "已訂閱",
    newsletterSuccessMsg: "訂閱成功！請前往收件箱完成確認。",
    newsletterErrorMsg: "訂閱失敗，請稍後再試。",
    newsletterEmailError: "請輸入有效的電子郵件地址",
    newsletterNoSpam: "我們不會發送垃圾郵件，也不會出售您的電子郵件地址。",
    newsletterDailyDigestOptIn: "每日摘要 — 以電郵接收精選 AI 文章",

    heroBadge: "每日更新 · 繁體中文",
    heroTitle1: "AI 浪潮",
    heroTitle2: "由你開始追上",
    heroDesc: "AI 趨勢文章、工具觀察、實用教學與長線分析，協助您理解 AI 如何改變世界。",
    heroCta1: "查看今日熱門",
    heroCta2: "探索 AI 工具",
    heroStat1Key: "AI 文章",
    heroStat1Val: "300+",
    heroStat2Key: "AI 工具",
    heroStat2Val: "120+",
    heroStat3Key: "更新",
    heroStat3Val: "每日",

    readTime: "分鐘閱讀",
    minutes: "分鐘",
    minRead: "分鐘",
    openWebsite: "開啟官網",
    backToNews: "返回文章列表",
    contentPreparing: "文章內容準備中...",

    pricingFree: "免費",
    pricingFreemium: "Freemium",
    pricingPaid: "付費",

    newsPageTitle: "AI 文章",
    newsPageDesc: "以 Blog 形式整理 AI 趨勢、工具觀察、研究摘要與產業分析，涵蓋模型發布與市場變化。",

    toolsPageTitle: "熱門 AI 工具",
    toolsPageDesc: "每週評測並分類整理，協助您選擇合適的 AI 工具，涵蓋免費方案至企業級方案。",

    tutorialsPageTitle: "AI 教學",
    tutorialsPageDesc: "以循序漸進的方式協助您從零開始使用 AI。內容免費、以繁體中文撰寫，並包含實作示例。",
  },
  en: {
    latestNews: "Latest Updates",
    latestNewsTitle: "Latest AI Articles",
    latestNewsDesc: "Continuously updated with selected AI analysis and deep dives.",

    trendingNews: "Trending Today",
    trendingNewsTitle: "Today's AI Trending",
    trendingNewsDesc: "Editor picks — the AI moves worth knowing.",

    trendingTools: "Trending Tools",
    trendingToolsTitle: "Trending AI Tools",
    trendingToolsDesc: "Editor-tested weekly, featuring AI tools with practical value.",

    newsletter: "Weekly Newsletter",
    newsletterTitle: "AI highlights delivered to your inbox weekly",
    newsletterDesc:
      "We condense the week's most important AI developments, new tools, and practical prompts. Free, unsubscribe anytime.",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "Subscribe",
    newsletterSuccess: "Subscribed",
    newsletterSuccessMsg: "Subscribed! Check your inbox to confirm.",
    newsletterErrorMsg: "Subscription failed. Please try again later.",
    newsletterEmailError: "Please enter a valid email",
    newsletterNoSpam: "No spam, never sell your email.",
    newsletterDailyDigestOptIn: "Daily digest — get top AI articles by email every day",

    heroBadge: "Daily updates · English",
    heroTitle1: "AI Wave",
    heroTitle2: "Stay ahead starting today",
    heroDesc: "AI trend articles, tool observations, tutorials and long-form analysis — one place to understand how AI is changing the world.",
    heroCta1: "See today's trending",
    heroCta2: "Explore AI tools",
    heroStat1Key: "AI Articles",
    heroStat1Val: "300+",
    heroStat2Key: "AI Tools",
    heroStat2Val: "120+",
    heroStat3Key: "Updates",
    heroStat3Val: "Daily",

    readTime: "min read",
    minutes: "min",
    minRead: "min read",
    openWebsite: "Open website",
    backToNews: "Back to articles",
    contentPreparing: "Article content coming soon...",

    pricingFree: "Free",
    pricingFreemium: "Freemium",
    pricingPaid: "Paid",

    newsPageTitle: "AI Blog",
    newsPageDesc: "AI trends, tool observations, research summaries and industry analysis in a blog format.",

    toolsPageTitle: "Trending AI Tools",
    toolsPageDesc: "Weekly reviews across all categories. Find the right tool for you, from free to enterprise.",

    tutorialsPageTitle: "AI Tutorials",
    tutorialsPageDesc: "Step-by-step guides to get started with AI, with practical examples and hands-on workflows.",
  },
} as const;


export function containsCJK(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some((item) => containsCJK(item));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => containsCJK(item));
  return /[\u4e00-\u9fff]/.test(String(value));
}

export function hasEnglishDisplayContent(
  item: Record<string, unknown>,
  fields: string[] = ["title", "excerpt", "name", "tagline", "description"]
): boolean {
  return !fields.some((field) => containsCJK(item[field]));
}

export type UIKey = keyof (typeof UI_STRINGS)["zh"];
export type UIStrings = Record<UIKey, string>;

export function getUIStrings(lang: any): UIStrings {
  if (lang === "en") return UI_STRINGS.en;
  return UI_STRINGS.zh;
}

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

  return {
    ...item,
    title: item.title_en ?? item.title,
    excerpt: item.excerpt_en ?? item.excerpt,
    content: item.content_en ?? item.content,
  };
}

export function hasLocalizedArticleContent(item: Record<string, unknown>, lang: Lang): boolean {
  if (lang === "zh") {
    return Boolean(item.title_zh || item.title);
  }
  return Boolean(item.title_en);
}

export const UI_STRINGS = {
  zh: {
    latestNews: "最新更新",
    latestNewsTitle: "最新 AI 文章",
    latestNewsDesc: "精選 AI 趨勢分析、工具觀察、研究摘要與深度文章，幫你快速掌握人工智能最新發展。",

    trendingNews: "今日熱門",
    trendingNewsTitle: "今日 AI 熱點",
    trendingNewsDesc: "編輯精選值得留意的 AI 新聞、模型更新與產業動態。",

    trendingTools: "熱門工具",
    trendingToolsTitle: "熱門 AI 工具",
    trendingToolsDesc: "每週整理具實用價值的 AI 工具，涵蓋寫作、設計、影片、編程與生產力。",

    newsletter: "每週 Newsletter",
    newsletterTitle: "每週 AI 重點，直接送到你的 inbox",
    newsletterDesc:
      "我們整理一週最重要的 AI 發展、新工具、教學與實用提示。免費訂閱，可隨時取消。",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "訂閱",
    newsletterSuccess: "已訂閱",
    newsletterSuccessMsg: "訂閱成功！請查看 inbox 完成確認。",
    newsletterErrorMsg: "訂閱失敗，請稍後再試。",
    newsletterEmailError: "請輸入有效電郵地址",
    newsletterNoSpam: "不發垃圾郵件，也不會出售你的電郵。",
    newsletterDailyDigestOptIn: "每日摘要：每天收到精選 AI 文章",

    heroBadge: "每日更新 | 中文 / English",
    heroTitle1: "AI 趨勢",
    heroTitle2: "由今天開始掌握",
    heroDesc:
      "Radar AI Studio 整合 AI 趨勢文章、工具觀察、實用教學與深度分析，幫你理解人工智能如何改變工作、創作與商業。",
    heroCta1: "查看今日熱門",
    heroCta2: "探索 AI 工具",
    heroStat1Key: "AI 文章",
    heroStat1Val: "300+",
    heroStat2Key: "AI 工具",
    heroStat2Val: "120+",
    heroStat3Key: "更新節奏",
    heroStat3Val: "每日",

    readTime: "閱讀時間",
    minutes: "分鐘",
    minRead: "分鐘閱讀",
    openWebsite: "開啟網站",
    backToNews: "返回文章",
    contentPreparing: "文章內容準備中...",

    pricingFree: "免費",
    pricingFreemium: "Freemium",
    pricingPaid: "付費",

    newsPageTitle: "AI 文章",
    newsPageDesc: "以 blog 形式整理 AI 趨勢、工具觀察、研究摘要與產業分析。",

    toolsPageTitle: "熱門 AI 工具",
    toolsPageDesc: "按類別整理實用 AI 工具，幫你比較免費、Freemium 與付費方案。",

    tutorialsPageTitle: "AI 教學",
    tutorialsPageDesc: "一步步學習 AI 工具、prompt、工作流程與實戰應用。",
  },
  en: {
    latestNews: "Latest Updates",
    latestNewsTitle: "Latest AI Articles",
    latestNewsDesc: "Selected AI analysis, tool observations, research summaries, and deep dives.",

    trendingNews: "Trending Today",
    trendingNewsTitle: "Today's AI Trending",
    trendingNewsDesc: "Editor picks: the AI moves worth knowing.",

    trendingTools: "Trending Tools",
    trendingToolsTitle: "Trending AI Tools",
    trendingToolsDesc: "Editor-tested weekly, featuring AI tools with practical value.",

    newsletter: "Weekly Newsletter",
    newsletterTitle: "AI highlights delivered to your inbox weekly",
    newsletterDesc:
      "We condense the week's most important AI developments, new tools, tutorials, and practical prompts. Free, unsubscribe anytime.",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "Subscribe",
    newsletterSuccess: "Subscribed",
    newsletterSuccessMsg: "Subscribed! Check your inbox to confirm.",
    newsletterErrorMsg: "Subscription failed. Please try again later.",
    newsletterEmailError: "Please enter a valid email",
    newsletterNoSpam: "No spam, never sell your email.",
    newsletterDailyDigestOptIn: "Daily digest: get top AI articles by email every day",

    heroBadge: "Daily updates | English",
    heroTitle1: "AI Wave",
    heroTitle2: "Stay ahead starting today",
    heroDesc:
      "AI trend articles, tool observations, tutorials and long-form analysis in one place to understand how AI is changing work, creation and business.",
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
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((item) => containsCJK(item));
  }
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

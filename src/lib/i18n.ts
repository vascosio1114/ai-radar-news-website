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
      content_html: item.content_html ?? item.content_zh ?? item.content,
    };
  }
  return item;
}

export const UI_STRINGS = {
  zh: {
    latestNews: "最新更新",
    latestNewsTitle: "最新 AI 新聞",
    latestNewsDesc: "不停更新，揀啱你嘅一篇 deep dive。",

    trendingNews: "今日熱門",
    trendingNewsTitle: "今日 AI 熱門",
    trendingNewsDesc: "編輯精選，最值得知嘅 AI 動向。",

    trendingTools: "熱門工具",
    trendingToolsTitle: "Trending AI Tools",
    trendingToolsDesc: "編輯每星期實測，揀出真正有用嘅 AI 工具。",

    newsletter: "每週通訊",
    newsletterTitle: "每週直送你 inbox 嘅 AI 精華",
    newsletterDesc:
      "我哋每星期幫你濃縮整週最緊要嘅 AI 動向、新工具同實用 prompt。免費，可隨時退訂。",
    newsletterPlaceholder: "you@example.com",
    newsletterButton: "訂閱",
    newsletterSuccess: "已訂閱",
    newsletterSuccessMsg: "訂閱成功！記得 check 你個 inbox 確認。",
    newsletterErrorMsg: "訂閱失敗，請稍後再試。",
    newsletterEmailError: "唔該輸入有效嘅 email",
    newsletterNoSpam: "我哋唔會 spam，亦唔會將你嘅 email 賣俾人。",
    newsletterDailyDigestOptIn: "每日digest — 每日電郵接收精選 AI 文章",

    heroBadge: "每日更新 · 繁體中文",
    heroTitle1: "AI 浪潮",
    heroTitle2: "由你開始追上",
    heroDesc: "最新 AI 新聞、AI 工具評測、實用教學同趨勢分析。一個地方，幫你睇懂 AI 點樣改變世界。",
    heroCta1: "睇今日熱門",
    heroCta2: "探索 AI 工具",
    heroStat1Key: "AI 新聞",
    heroStat1Val: "300+",
    heroStat2Key: "AI 工具",
    heroStat2Val: "120+",
    heroStat3Key: "更新",
    heroStat3Val: "每日",

    readTime: "分鐘閱讀",
    minutes: "分鐘",
    minRead: "分鐘",
    openWebsite: "開啟官網",
    backToNews: "返回新聞列表",
    contentPreparing: "文章內容準備中...",

    pricingFree: "免費",
    pricingFreemium: "Freemium",
    pricingPaid: "付費",

    newsPageTitle: "最新 AI 新聞",
    newsPageDesc: "編輯團隊每日整理嘅 AI 新聞。由 model release 到產業動向，一個地方睇齊。",

    toolsPageTitle: "熱門 AI 工具",
    toolsPageDesc: "每星期評測，分類齊全。揀岩你嘅工具，由免費到 enterprise 都有。",

    tutorialsPageTitle: "AI 教學",
    tutorialsPageDesc: "一步步教你由零開始用 AI。免費、繁體中文、有實作。",
  },
  en: {
    latestNews: "Latest Updates",
    latestNewsTitle: "Latest AI News",
    latestNewsDesc: "Constantly updated. Pick the perfect deep dive for you.",

    trendingNews: "Trending Today",
    trendingNewsTitle: "Today's AI Trending",
    trendingNewsDesc: "Editor picks — the AI moves worth knowing.",

    trendingTools: "Trending Tools",
    trendingToolsTitle: "Trending AI Tools",
    trendingToolsDesc: "Editor-tested weekly. Real useful AI tools only.",

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

    heroBadge: "Daily updates · Traditional Chinese",
    heroTitle1: "AI Wave",
    heroTitle2: "Stay ahead starting today",
    heroDesc: "The latest AI news, tool reviews, tutorials and trend analysis. One place to understand how AI is changing the world.",
    heroCta1: "See today's trending",
    heroCta2: "Explore AI tools",
    heroStat1Key: "AI News",
    heroStat1Val: "300+",
    heroStat2Key: "AI Tools",
    heroStat2Val: "120+",
    heroStat3Key: "Updates",
    heroStat3Val: "Daily",

    readTime: "min read",
    minutes: "min",
    minRead: "min read",
    openWebsite: "Open website",
    backToNews: "Back to news",
    contentPreparing: "Article content coming soon...",

    pricingFree: "Free",
    pricingFreemium: "Freemium",
    pricingPaid: "Paid",

    newsPageTitle: "Latest AI News",
    newsPageDesc: "Daily AI news curated by our editorial team. From model releases to industry trends, all in one place.",

    toolsPageTitle: "Trending AI Tools",
    toolsPageDesc: "Weekly reviews across all categories. Find the right tool for you, from free to enterprise.",

    tutorialsPageTitle: "AI Tutorials",
    tutorialsPageDesc: "Step-by-step guides to get started with AI. Free, in Traditional Chinese, with hands-on practice.",
  },
} as const;

export type UIKey = keyof (typeof UI_STRINGS)["zh"];
export type UIStrings = Record<UIKey, string>;

export function getUIStrings(lang: any): UIStrings {
  if (lang === "en") return UI_STRINGS.en;
  return UI_STRINGS.zh;
}

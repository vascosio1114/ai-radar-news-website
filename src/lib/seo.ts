import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_URL, type Lang } from "@/lib/site";

export const seoKeywords = [
  "AI news",
  "AI tools",
  "AI tutorials",
  "AI resources",
  "AI trend analysis",
  "ChatGPT",
  "artificial intelligence",
  "AI blog",
  "AI 文章",
  "AI 工具",
  "AI 教學",
  "人工智能",
  "生成式 AI",
];

export function localizedSiteDescription(lang: Lang) {
  if (lang === "zh") {
    return "Radar AI Studio 整理 AI 文章、AI 工具、實用教學、資源與趨勢分析，幫助創作者、營運人員、專業人士和學習者理解人工智能。";
  }

  return SITE_DESCRIPTION;
}

export function absoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_EMAIL,
    logo: `${SITE_URL}/images/airadarstudio_logo.jpg`,
    image: `${SITE_URL}/images/radar-ai-studio-bg.jpeg`,
    description: SITE_DESCRIPTION,
    knowsAbout: seoKeywords,
  };
}

export function websiteJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: lang === "zh" ? "zh-HK" : "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
    description: localizedSiteDescription(lang),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${lang}/news?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: lang === "zh" ? "AI 文章、工具與教學" : "AI articles, tools and tutorials",
    url: `${SITE_URL}/${lang}`,
    description: localizedSiteDescription(lang),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function articleJsonLd({
  lang,
  url,
  title,
  description,
  image,
  author,
  publishedAt,
  modifiedAt,
  tags,
}: {
  lang: Lang;
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  tags?: string[] | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description: description ?? undefined,
    image: absoluteUrl(image) ?? `${SITE_URL}/images/radar-ai-studio-bg.jpeg`,
    datePublished: publishedAt ?? undefined,
    dateModified: modifiedAt ?? publishedAt ?? undefined,
    inLanguage: lang === "zh" ? "zh-HK" : "en",
    author: {
      "@type": "Person",
      name: author || "Radar AI Studio Editorial Team",
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: url,
    keywords: tags?.join(", ") || seoKeywords.join(", "),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

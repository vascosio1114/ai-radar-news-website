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
  "AI 工具",
  "AI 教學",
  "人工智能",
  "生成式 AI",
];

export function localizedSiteDescription(lang: Lang) {
  if (lang === "zh") {
    return "Radar AI Studio 提供 AI 文章、AI 工具目錄、教學、資源與趨勢分析，幫助創作者、營運者、開發者與專業人士掌握人工智能發展。";
  }

  return SITE_DESCRIPTION;
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

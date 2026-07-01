import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DEFAULT_LANG, SITE_NAME, SITE_URL, SUPPORTED_LANGS, type Lang } from "@/lib/site";
import {
  collectionJsonLd,
  localizedSiteDescription,
  organizationJsonLd,
  seoKeywords,
  websiteJsonLd,
} from "@/lib/seo";

type Props = { children: React.ReactNode; params: { lang: string } };

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const description = localizedSiteDescription(lang);
  const title =
    lang === "zh"
      ? "AI 文章、工具、教學與趨勢"
      : "AI News, Tools, Tutorials and Trends";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: seoKeywords,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        "zh-HK": `${SITE_URL}/zh`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${lang}`,
      siteName: SITE_NAME,
      locale: lang === "zh" ? "zh_HK" : "en_US",
      type: "website",
      images: [
        {
          url: "/images/radar-ai-studio-bg.jpeg",
          width: 1536,
          height: 1024,
          alt: `${SITE_NAME} AI intelligence platform`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ["/images/radar-ai-studio-bg.jpeg"],
    },
  };
}

export default function LangLayout({ children, params }: Props) {
  if (!SUPPORTED_LANGS.includes(params.lang as Lang)) {
    redirect(`/${DEFAULT_LANG}`);
  }

  const lang = params.lang as Lang;
  const graph = [
    organizationJsonLd(),
    websiteJsonLd(lang),
    collectionJsonLd(lang),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME, SITE_URL, SUPPORTED_LANGS, DEFAULT_LANG, type Lang } from "@/lib/site";

type Props = { children: React.ReactNode; params: { lang: string } };

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return {
      metadataBase: new URL(SITE_URL),
      title: {
        default: `${SITE_NAME} — AI Intelligence Platform`,
        template: `%s · ${SITE_NAME}`,
      },
      description: "AI articles, tools, tutorials and trend analysis for people building with artificial intelligence.",
      keywords: ["AI", "Artificial Intelligence", "ChatGPT", "AI tools", "AI blog", "AI tutorials", "AI trends"],
      openGraph: {
        title: `${SITE_NAME} — AI Intelligence Platform`,
        description: "AI articles, tools, tutorials and trend analysis.",
        url: `${SITE_URL}/en`,
        siteName: SITE_NAME,
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: SITE_NAME,
        description: "AI articles, tools, tutorials and trend analysis.",
      },
    };
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} — 中文 AI 智能資訊平台`,
      template: `%s · ${SITE_NAME}`,
    },
    description: "AI 文章、AI 工具評測、AI 教學與趨勢分析，協助讀者掌握人工智能的最新發展。",
    keywords: ["AI", "人工智能", "ChatGPT", "AI 工具", "AI 文章", "AI 教學", "AI 趨勢"],
    openGraph: {
      title: `${SITE_NAME} — 中文 AI 智能資訊平台`,
      description: "AI 文章、工具、教學與趨勢分析。",
      url: `${SITE_URL}/zh`,
      siteName: SITE_NAME,
      locale: "zh_HK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: "AI 文章、工具、教學與趨勢分析。",
    },
  };
}

export default function LangLayout({ children, params }: Props) {
  if (!SUPPORTED_LANGS.includes(params.lang as Lang)) {
    redirect(`/${DEFAULT_LANG}`);
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

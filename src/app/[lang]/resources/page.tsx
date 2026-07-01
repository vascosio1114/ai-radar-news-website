import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import { SITE_URL, type Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const title = lang === "en" ? "Resources" : "AI 資源";
  const description =
    lang === "en"
      ? "Curated AI resources, workflows, reference sources, and learning materials from Radar AI Studio."
      : "Radar AI Studio 精選 AI 資源、工作流程、參考來源與學習材料，幫你更有效理解及應用人工智能。";
  const path = `/${lang}/resources`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        "zh-Hant": `${SITE_URL}/zh/resources`,
        en: `${SITE_URL}/en/resources`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}${path}` },
  };
}

export default function ResourcesPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="Resources"
        title="Practical AI resources for builders and learners."
        description="A curated hub for useful AI references, workflows and learning materials. This section will continue to expand as the platform grows."
        sections={[
          {
            title: "Editorial resources",
            body: "Reference materials used by the Radar AI Studio editorial workflow, including trusted AI labs, research sources and developer communities.",
            items: ["AI lab blogs", "Research papers", "Developer communities", "Tool directories"],
          },
          {
            title: "Learning pathways",
            body: "Structured reading paths for beginners, students, founders and professionals who want to apply AI responsibly.",
            items: ["ChatGPT fundamentals", "AI tools for productivity", "Prompting and automation", "AI trend analysis"],
          },
          {
            title: "Business use cases",
            body: "Examples of how AI can support content creation, research, operations, customer service and internal knowledge workflows.",
          },
          {
            title: "Coming next",
            body: "We plan to add downloadable guides, templates, newsletters and premium course material in future phases.",
          },
        ]}
        cta={{ label: "Read AI Blog", href: "/en/news" }}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="AI 資源"
      title="實用 AI 資源，幫你更快理解和應用人工智能。"
      description="這裡整理 Radar AI Studio 編輯流程中常用的參考來源、學習路線和實戰材料，適合創作者、營運人員、學生與專業人士。"
      sections={[
        {
          title: "編輯參考來源",
          body: "我們整理可信的 AI 實驗室、研究社群、開發者平台和工具資料庫，作為撰寫文章和分析趨勢的基礎。",
          items: ["AI 實驗室官方 blog", "研究論文與技術報告", "開發者社群", "AI 工具目錄"],
        },
        {
          title: "學習路線",
          body: "由入門概念到實際工作流程，幫不同背景的讀者逐步掌握 AI 工具和應用場景。",
          items: ["ChatGPT 基礎使用", "AI 生產力工具", "Prompt 與自動化", "AI 趨勢分析"],
        },
        {
          title: "實戰應用場景",
          body: "了解 AI 如何支援內容創作、資料研究、營運流程、客戶服務和內部知識管理。",
        },
        {
          title: "即將加入",
          body: "未來會加入下載指南、範本、newsletter 精選和進階課程材料。",
        },
      ]}
      cta={{ label: "閱讀 AI 文章", href: "/zh/news" }}
    />
  );
}

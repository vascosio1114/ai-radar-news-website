import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import type { Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: params.lang === "en" ? "Resources" : "資源",
    description:
      params.lang === "en"
        ? "Curated AI resources, workflows and learning materials from AI Radar."
        : "AI Radar 精選人工智能資源、工作流程與學習材料。",
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
            body: "Reference materials used by the AI Radar editorial workflow, including trusted AI labs, research sources and developer communities.",
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
      eyebrow="資源"
      title="為創作者、學生與專業人士整理的 AI 資源。"
      description="這裡會集中整理 AI Radar 的精選參考資料、實用工作流程與學習材料，並會隨平台發展持續更新。"
      sections={[
        {
          title: "編輯參考來源",
          body: "整理 AI Radar 內容流程中常用的可信來源，包括主要 AI 實驗室、研究平台與開發者社群。",
          items: ["AI 實驗室官方文章", "研究論文與技術報告", "開發者社群討論", "AI 工具資料庫"],
        },
        {
          title: "學習路線",
          body: "為初學者、學生、創業者與職場人士設計的學習方向，協助讀者更有系統地理解與應用人工智能。",
          items: ["ChatGPT 基礎應用", "生產力 AI 工具", "提示詞與自動化", "AI 趨勢分析"],
        },
        {
          title: "商業應用場景",
          body: "展示 AI 如何支援內容製作、資料研究、營運流程、客服回應與企業內部知識管理。",
        },
        {
          title: "後續規劃",
          body: "未來將加入可下載指南、範本、電子報資源與進階課程內容。",
        },
      ]}
      cta={{ label: "閱讀 AI 文章", href: "/zh/news" }}
    />
  );
}

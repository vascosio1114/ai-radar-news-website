import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import type { Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: params.lang === "en" ? "About" : "關於我們",
    description:
      params.lang === "en"
        ? "Learn about AI Radar and our editorial mission."
        : "了解 AI Radar 的平台定位與內容使命。",
  };
}

export default function AboutPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="About"
        title="An AI intelligence studio for readers who want signal, not noise."
        description="AI Radar tracks meaningful AI developments and turns them into concise articles, practical resources and structured insights."
        sections={[
          {
            title: "Our mission",
            body: "We help readers understand the fast-moving AI landscape without being overwhelmed by fragmented updates and low-quality hype.",
          },
          {
            title: "What we publish",
            body: "We focus on AI articles, tool analysis, tutorials, automation workflows and long-term industry trends.",
          },
          {
            title: "Editorial approach",
            body: "We prioritise credibility, clarity and practical value. Automated discovery supports the workflow, while human review protects quality.",
          },
          {
            title: "Who it is for",
            body: "Students, creators, operators, founders and professionals who want to understand and use AI with confidence.",
          },
        ]}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="關於我們"
      title="為重視深度與可信度的讀者而設的 AI 智能資訊平台。"
      description="AI Radar 追蹤重要的人工智能發展，並將資訊整理成文章、實用資源與結構化洞察。"
      sections={[
        {
          title: "我們的使命",
          body: "我們希望協助讀者在快速變化的 AI 資訊環境中分辨重點，避免被零散消息與低質炒作淹沒。",
        },
        {
          title: "內容方向",
          body: "平台聚焦 AI 文章、工具分析、教學內容、自動化流程與長期產業趨勢。",
        },
        {
          title: "編輯原則",
          body: "我們重視可信度、清晰度與實用價值。自動化收集協助提升效率，而人工審核則確保內容品質。",
        },
        {
          title: "適合讀者",
          body: "適合學生、創作者、營運人員、創業者，以及希望更有信心理解與應用 AI 的專業人士。",
        },
      ]}
    />
  );
}

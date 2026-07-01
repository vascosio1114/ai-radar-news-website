import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import { SITE_NAME, SITE_URL, type Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const title = lang === "en" ? "About" : "關於我們";
  const description =
    lang === "en"
      ? "Learn about Radar AI Studio and our editorial mission to make AI news, tools and tutorials easier to understand."
      : "了解 Radar AI Studio 如何整理 AI 文章、工具、教學與趨勢分析，幫讀者掌握真正重要的人工智能資訊。";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/about`,
      languages: {
        "zh-HK": `${SITE_URL}/zh/about`,
        en: `${SITE_URL}/en/about`,
      },
    },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/${lang}/about` },
  };
}

export default function AboutPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="About"
        title="An AI intelligence site for readers who want signal, not noise."
        description="Radar AI Studio tracks meaningful AI developments and turns them into concise articles, practical resources and structured insights."
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
      title="為想掌握 AI 訊號的讀者，整理真正值得看的人工智能資訊。"
      description="Radar AI Studio 追蹤重要 AI 發展，將模型更新、工具發佈、研究動態和產業變化整理成清晰文章、實用資源與結構化洞察。"
      sections={[
        {
          title: "我們的使命",
          body: "我們希望幫讀者理解快速變化的 AI 世界，避開碎片化資訊和低質炒作，集中掌握真正重要的訊號。",
        },
        {
          title: "我們發布甚麼",
          body: "內容包括 AI 文章、工具分析、實用教學、自動化工作流程，以及長期產業趨勢觀察。",
        },
        {
          title: "編輯方式",
          body: "我們重視可信度、清晰度和實用價值。自動化流程協助發現資訊，人手編輯則負責判斷脈絡與品質。",
        },
        {
          title: "適合誰閱讀",
          body: "適合學生、創作者、營運人員、創業者和專業人士，協助大家更有信心地理解和使用 AI。",
        },
      ]}
    />
  );
}

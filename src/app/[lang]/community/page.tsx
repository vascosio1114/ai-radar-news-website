import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { getCommunityMembers, getTrendingTags } from "@/lib/dashboard/queries";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = { params: { lang: string } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const title = lang === "en" ? "Community" : "AI 社群";
  const description =
    lang === "en"
      ? "Join the Radar AI Studio community to discuss AI tools, articles and trends."
      : "加入 Radar AI Studio 社群，討論 AI 工具、文章、實戰經驗與產業趨勢。";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/community`,
      languages: {
        "zh-HK": `${SITE_URL}/zh/community`,
        en: `${SITE_URL}/en/community`,
      },
    },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/${lang}/community` },
  };
}

export default async function CommunityPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";
  const [members, tags] = await Promise.all([
    getCommunityMembers(5),
    getTrendingTags(6),
  ]);

  return (
    <div className="container-page section-pad">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Community
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {lang === "zh" ? "Radar AI Studio 社群" : "Radar AI Studio Community"}
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {lang === "zh"
            ? "討論 AI 工具、分享實戰經驗，並追蹤值得留意的產業訊號。"
            : "Discuss AI tools, share practical experience and follow the industry signals worth watching."}
        </p>
      </header>

      <CommunityFeed lang={lang} sidebarData={{ members, tags }} />
    </div>
  );
}

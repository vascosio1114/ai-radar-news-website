import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { getCommunityMembers, getTrendingTags } from "@/lib/dashboard/queries";

type Props = { params: { lang: string } };

export function generateMetadata({ params }: Props): Metadata {
  const isEn = params.lang === "en";
  return {
    title: isEn ? "Community" : "社群",
    description: isEn
      ? "Join the AI Radar community to discuss AI tools, articles and trends."
      : "加入 AI Radar 社群，討論 AI 工具、文章與趨勢。",
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
          {lang === "zh" ? "AI Radar 社群" : "AI Radar Community"}
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {lang === "zh"
            ? "討論 AI 工具、分享實作經驗，並追蹤值得關注的產業動態。"
            : "Discuss AI tools, share practical experience and follow the industry signals worth watching."}
        </p>
      </header>

      <CommunityFeed lang={lang} sidebarData={{ members, tags }} />
    </div>
  );
}

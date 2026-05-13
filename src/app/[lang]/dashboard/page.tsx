import type { Metadata } from "next";
import {
  getStats,
  getDailyTrend,
  getSources,
  getLatestItems,
} from "@/lib/dashboard/queries";
import { StatsHero } from "@/components/dashboard/StatsHero";
import { DailyChart } from "@/components/dashboard/DailyChart";
import { LatestFeed } from "@/components/dashboard/LatestFeed";
import { SourceStatus } from "@/components/dashboard/SourceStatus";

export const metadata: Metadata = {
  title: "AI 動態儀表板",
  description:
    "AI Radar 每 12 小時自動由 10 個全球 AI source 收集嘅 raw data — real-time 趨勢、熱話題、最新動向。",
};

// Cache 60 seconds — incremental static regen
export const revalidate = 60;

export default async function DashboardPage() {
  const [stats, daily, sources, latest] = await Promise.all([
    getStats(),
    getDailyTrend(),
    getSources(),
    getLatestItems(12),
  ]);

  return (
    <>
      <StatsHero stats={stats} />
      <DailyChart data={daily} />
      <LatestFeed items={latest} />
      <SourceStatus sources={sources} />
    </>
  );
}

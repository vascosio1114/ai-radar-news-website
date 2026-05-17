import type { Metadata } from "next";
import {
  getStats,
  getDailyTrend,
  getSources,
  getLatestItems,
  getJobImpactTrend,
} from "@/lib/dashboard/queries";
import { StatsHero } from "@/components/dashboard/StatsHero";
import { DailyChart } from "@/components/dashboard/DailyChart";
import { LatestFeed } from "@/components/dashboard/LatestFeed";
import { SourceStatus } from "@/components/dashboard/SourceStatus";
import { JobImpactTicker } from "@/components/dashboard/JobImpactTicker";

export const metadata: Metadata = {
  title: "Agent 動態｜Admin",
  description: "查看 AI Radar 自動 ingest agent 收集到嘅來源、最新 raw items、source health 同趨勢數據。",
};

export const revalidate = 60;

export default async function AdminAgentPage() {
  const [stats, daily, sources, latest, jobImpact] = await Promise.all([
    getStats(),
    getDailyTrend(),
    getSources(),
    getLatestItems(12),
    getJobImpactTrend(),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-ink-200 bg-white/80 p-6 shadow-soft dark:border-ink-800 dark:bg-ink-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-600 dark:text-accent-400">
          Agent Monitor
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink-950 dark:text-white">
          今日 Agent 收集動態
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
          呢度係內部監控頁：睇到每 12 小時自動 ingest pipeline 收咗啲乜、邊個 source 正常、邊個 source 有 error，以及最近收集到嘅 raw items。
        </p>
      </div>

      <StatsHero stats={stats} />
      <DailyChart data={daily} />
      <JobImpactTicker trend={jobImpact} />
      <LatestFeed items={latest} />
      <SourceStatus sources={sources} />
    </div>
  );
}

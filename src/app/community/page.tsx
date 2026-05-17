import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the AI Radar community to discuss AI tools, news, and trends.",
};

export default function CommunityPage() {
  return (
    <div className="container-page section-pad">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          Community
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          AI Radar 社群
        </h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400 md:text-base">
          討論 AI 工具、分享心得、關注最新動態。
        </p>
      </header>

      <CommunityFeed />
    </div>
  );
}
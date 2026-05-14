import type { Metadata } from "next";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { NewThreadModal } from "@/components/community/NewThreadModal";

export const metadata: Metadata = {
  title: "Community",
  description: "AI Radar community forum",
};

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-100">
            Community
          </h1>
          <p className="mt-2 text-ink-500 dark:text-ink-400">
            與 AI Radar 社群一起探索最新 AI 技術
          </p>
        </div>
        <NewThreadModal />
      </div>

      <div className="mx-auto max-w-2xl">
        <CommunityFeed />
      </div>
    </div>
  );
}
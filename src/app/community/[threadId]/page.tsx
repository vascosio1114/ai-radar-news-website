import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ThreadDetailClient } from "@/components/community/ThreadDetailClient";

interface ThreadDetailPageProps {
  params: Promise<{ threadId: string }>;
}

export async function generateMetadata({ params }: ThreadDetailPageProps): Promise<Metadata> {
  const { threadId } = await params;
  return {
    title: `Thread ${threadId.slice(0, 8)}... | Community`,
    description: "View this thread in the AI Radar community.",
  };
}

export default async function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const { threadId } = await params;

  return (
    <div className="container-page section-pad">
      <ThreadDetailClient threadId={threadId} />
    </div>
  );
}
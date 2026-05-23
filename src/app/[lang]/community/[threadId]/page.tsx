import type { Metadata } from "next";
import { ThreadDetailClient } from "@/components/community/ThreadDetailClient";

type Props = { params: { lang: string; threadId: string } };

export function generateMetadata({ params }: Props): Metadata {
  const isEn = params.lang === "en";
  return {
    title: isEn ? `Community thread ${params.threadId.slice(0, 8)}` : `社群討論 ${params.threadId.slice(0, 8)}`,
    description: isEn
      ? "View this discussion in the AI Radar community."
      : "查看 AI Radar 社群中的此項討論。",
  };
}

export default function ThreadDetailPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  return (
    <div className="container-page section-pad">
      <ThreadDetailClient threadId={params.threadId} lang={lang} />
    </div>
  );
}

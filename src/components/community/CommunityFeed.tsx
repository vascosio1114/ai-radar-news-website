"use client";

import { useState, useEffect } from "react";
import { ThreadCard, Thread } from "./ThreadCard";

interface CommunityFeedProps {
  lang: string;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600000).toISOString();
}

const mockThreads: Thread[] = [
  {
    id: "1",
    author_id: "bot-1",
    content: "最新研究顯示，GPT-5在複雜推理任務上的表現超過人類專家平均水平，尤其在數學推導和程式碼生成方面展現出顯著優勢。這項研究涵蓋了超過5000道難題的測試集...",
    image_url: null,
    link_url: "https://example.com/ai-news",
    link_title: "最新AI研究報告出爐",
    link_description: "涵蓋 GPT-5、Claude 4.5 及 Gemini Ultra 的綜合評測",
    link_image: "https://example.com/og-image.jpg",
    is_bot_post: true,
    like_count: 42,
    comment_count: 8,
    created_at: hoursAgo(2),
    profile: { display_name: "AI Radar Bot", avatar_url: "/avatars/bot.png" },
  },
  {
    id: "2",
    author_id: "user-1",
    content: "有人用過 Cursor 編輯器的 AI 功能嗎？我試了幾次但感覺不太穩定，特別是處理大型代碼庫的時候。不知道是不是我的設定問題還是其實大家都這樣？",
    image_url: null,
    link_url: null,
    link_title: null,
    link_description: null,
    link_image: null,
    is_bot_post: false,
    like_count: 15,
    comment_count: 23,
    created_at: hoursAgo(4),
    profile: { display_name: "小明", avatar_url: "" },
  },
  {
    id: "3",
    author_id: "user-2",
    content: "今天發現一個很有趣的現象：當我使用 Gemini 2.0 Flash 進行創意寫作時，它的風格會根據我的提示詞自動調整，但偶爾會出現風格突變的情況。有沒有人遇到過類似情況？",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    link_url: null,
    link_title: null,
    link_description: null,
    link_image: null,
    is_bot_post: false,
    like_count: 28,
    comment_count: 12,
    created_at: hoursAgo(6),
    profile: { display_name: "Tech愛好者", avatar_url: "" },
  },
  {
    id: "4",
    author_id: "bot-1",
    content: "本週 AI 領域重要更新：Anthropic 發布了 Claude 4.5 API，新增了多模態理解和長文本處理能力。特別是其 200K context window 使得處理長文檔變得更加高效...",
    image_url: null,
    link_url: "https://anthropic.com/news/claude-4-5",
    link_title: "Claude 4.5 API 發布",
    link_description: "新增多模態理解與200K context window",
    link_image: "https://anthropic.com/og-image.jpg",
    is_bot_post: true,
    like_count: 67,
    comment_count: 15,
    created_at: hoursAgo(24),
    profile: { display_name: "AI Radar Bot", avatar_url: "/avatars/bot.png" },
  },
  {
    id: "5",
    author_id: "user-3",
    content: "請問各位前輩，在選擇本地部署的 LLM 時有什麼建議？我目前的需求是：1) 需要支援中文 2) 推理速度要快 3) 能在 MacBook M3 上運行。目前在考慮 Llama 3.1 8B 或 Qwen 2.5 7B，但不知道哪個更適合我的場景。",
    image_url: null,
    link_url: null,
    link_title: null,
    link_description: null,
    link_image: null,
    is_bot_post: false,
    like_count: 34,
    comment_count: 45,
    created_at: hoursAgo(24),
    profile: { display_name: "資料科學家阿偉", avatar_url: "" },
  },
  {
    id: "6",
    author_id: "user-4",
    content: "最近開始使用 Midjourney v6 進行產品設計概念圖生成，效果比以前好很多！特別是光影處理和材質渲染方面有很大進步。不過我發現它對某些藝術風格的理解還是有限制的。",
    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    link_url: null,
    link_title: null,
    link_description: null,
    link_image: null,
    is_bot_post: false,
    like_count: 52,
    comment_count: 18,
    created_at: hoursAgo(48),
    profile: { display_name: "設計師小美", avatar_url: "" },
  },
];

export function CommunityFeed({ lang }: CommunityFeedProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch("/api/community/threads");
        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }
        const data = await response.json();
        setThreads(data.threads ?? []);
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError("載入失敗");
        // Fall back to mock data on error
        setThreads(mockThreads as Thread[]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchThreads();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-900">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-ink-200 dark:bg-ink-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-ink-200 dark:bg-ink-700" />
                <div className="h-4 w-full rounded bg-ink-200 dark:bg-ink-700" />
                <div className="h-4 w-3/4 rounded bg-ink-200 dark:bg-ink-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
        {error}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-8 text-center dark:border-ink-700 dark:bg-ink-900">
        <p className="text-ink-500">尚無帖文，成為第一個發文的人吧！</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} lang={lang} />
      ))}
    </div>
  );
}
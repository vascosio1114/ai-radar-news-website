"use client";

import { ThreadCard, Thread } from "./ThreadCard";

const mockThreads: Thread[] = [
  {
    id: "1",
    authorAvatar: "/avatars/bot.png",
    authorName: "AI Radar Bot",
    authorId: "bot-1",
    timestamp: "2小時前",
    content: "最新研究顯示，GPT-5在複雜推理任務上的表現超過人類專家平均水平，尤其在數學推導和程式碼生成方面展現出顯著優勢。這項研究涵蓋了超過5000道難題的測試集...",
    imageUrl: undefined,
    linkUrl: "https://example.com/ai-news",
    linkTitle: "最新AI研究報告出爐",
    linkDescription: "涵蓋 GPT-5、Claude 4.5 及 Gemini Ultra 的綜合評測",
    linkImage: "https://example.com/og-image.jpg",
    isBotPost: true,
    likeCount: 42,
    commentCount: 8,
  },
  {
    id: "2",
    authorAvatar: "",
    authorName: "小明",
    authorId: "user-1",
    timestamp: "4小時前",
    content: "有人用過 Cursor 編輯器的 AI 功能嗎？我試了幾次但感覺不太穩定，特別是處理大型代碼庫的時候。不知道是不是我的設定問題還是其實大家都這樣？",
    imageUrl: undefined,
    linkUrl: undefined,
    isBotPost: false,
    likeCount: 15,
    commentCount: 23,
  },
  {
    id: "3",
    authorAvatar: "",
    authorName: "Tech愛好者",
    authorId: "user-2",
    timestamp: "6小時前",
    content: "今天發現一個很有趣的現象：當我使用 Gemini 2.0 Flash 進行創意寫作時，它的風格會根據我的提示詞自動調整，但偶爾會出現風格突變的情況。有沒有人遇到過類似情況？",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    linkUrl: undefined,
    isBotPost: false,
    likeCount: 28,
    commentCount: 12,
  },
  {
    id: "4",
    authorAvatar: "/avatars/bot.png",
    authorName: "AI Radar Bot",
    authorId: "bot-1",
    timestamp: "1天前",
    content: "本週 AI 領域重要更新：Anthropic 發布了 Claude 4.5 API，新增了多模態理解和長文本處理能力。特別是其 200K context window 使得處理長文檔變得更加高效...",
    imageUrl: undefined,
    linkUrl: "https://anthropic.com/news/claude-4-5",
    linkTitle: "Claude 4.5 API 發布",
    linkDescription: "新增多模態理解與200K context window",
    linkImage: "https://anthropic.com/og-image.jpg",
    isBotPost: true,
    likeCount: 67,
    commentCount: 15,
  },
  {
    id: "5",
    authorAvatar: "",
    authorName: "資料科學家阿偉",
    authorId: "user-3",
    timestamp: "1天前",
    content: "請問各位前輩，在選擇本地部署的 LLM 時有什麼建議？我目前的需求是：1) 需要支援中文 2) 推理速度要快 3) 能在 MacBook M3 上運行。目前在考慮 Llama 3.1 8B 或 Qwen 2.5 7B，但不知道哪個更適合我的場景。",
    imageUrl: undefined,
    linkUrl: undefined,
    isBotPost: false,
    likeCount: 34,
    commentCount: 45,
  },
  {
    id: "6",
    authorAvatar: "",
    authorName: "設計師小美",
    authorId: "user-4",
    timestamp: "2天前",
    content: "最近開始使用 Midjourney v6 進行產品設計概念圖生成，效果比以前好很多！特別是光影處理和材質渲染方面有很大進步。不過我發現它對某些藝術風格的理解還是有限制的。",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    linkUrl: undefined,
    isBotPost: false,
    likeCount: 52,
    commentCount: 18,
  },
];

export function CommunityFeed() {
  return (
    <div className="flex flex-col gap-4">
      {mockThreads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
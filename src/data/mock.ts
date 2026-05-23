import type { Article, Tool, Tutorial } from "@/types";

/**
 * 用於建立模板的示範資料。
 * 接通 Supabase 後，會在 page.tsx 以 server client 讀取正式資料取代。
 */

export const MOCK_ARTICLES: Article[] = [
  {
    id: "a1",
    slug: "openai-gpt-5-launch",
    title: "OpenAI 正式發布 GPT-5：推理能力再升級",
    excerpt:
      "GPT-5 在 reasoning、coding 與多模態任務上有明顯突破，並推出全新 agent mode。",
    cover_image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    category: "AI 新聞",
    tags: ["OpenAI", "GPT-5", "LLM"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    reading_time: 5,
    views: 12830,
    is_featured: true,
    is_published: true,
    content: `# OpenAI 正式發布 GPT-5：推理能力再升級

經過數月猜測，OpenAI 終於正式發布 GPT-5。本次更新不只是常規效能提升，而是加入了一系列全新能力，包括升級的推理引擎、改良的 agent mode，以及更強大的多模態處理。

## 主要新功能

### 推理引擎升級
GPT-5 採用了全新的推理架構，在複雜數學與邏輯推理任務上表現顯著提升。根據 OpenAI 官方的 Benchmark，GPT-5 在 MATH dataset 上達到 **92%** 準確率，遠高於 GPT-4 的 68%。

### Agent Mode 正式推出
本次發布最受矚目的是 Agent Mode。開發者可以為 GPT-5 配置一系列工具（browser、code executor、file system），模型會自動規劃並執行複雜任務。

\`\`\`python
# Agent Mode 示例：自動research任務
response = client.agents.create(
    model="gpt-5",
    instructions="研究最新 AI 發展趨勢並整理報告",
    tools=["browser", "code_executor"]
)
\`\`\`

### 多模態升級
除了文字，GPT-5 的 vision 能力亦有大幅提升，目前可以：

- 即時分析長影片串流
- 理解複雜圖表與數據視覺化
- 高精度 OCR 文件處理

## 定價

| Plan | 價格 | 限制 |
|------|------|------|
| Free | $0 | 每小時 20 條消息 |
| Plus | $20/mo | 80 條消息/小時 |
| Pro | $200/mo | 無限 + Agent Mode |

## 結論

GPT-5 的發布標誌著 LLM 邏輯推理能力的一大步。不過 Agent Mode 的實際表現仍有待觀察，建議開發者先在沙盒環境測試，再決定是否正式採用。

> 注意：Agent Mode 目前仍在 beta 階段，部分場景可能出現預期外行為。`,
  },
  {
    id: "a2",
    slug: "anthropic-claude-opus-4-6",
    title: "Anthropic 推 Claude Opus 4.6：長 context + agent skills",
    excerpt:
      "Opus 4.6 提升了長文檔處理與 tool use 穩定性，同時引入 skill 系統。",
    cover_image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    category: "AI 新聞",
    tags: ["Anthropic", "Claude"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    reading_time: 4,
    views: 8420,
    is_featured: true,
    is_published: true,
  },
  {
    id: "a3",
    slug: "google-gemini-3-multimodal",
    title: "Google Gemini 3 全新多模態：可即時處理影片",
    excerpt:
      "Gemini 3 加入即時影片串流分析，企業版可一次處理數百頁文件 + 多視訊輸入。",
    cover_image:
      "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&q=80",
    category: "AI 新聞",
    tags: ["Google", "Gemini", "Multimodal"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reading_time: 6,
    views: 5921,
    is_featured: false,
    is_published: true,
  },
  {
    id: "a4",
    slug: "ai-image-trends-2026",
    title: "2026 AI 生圖趨勢：寫實 + 實時 + 角色一致性",
    excerpt:
      "今年 AI 生圖最大進步不再只是解像度，而是角色一致性與 real-time inference。",
    cover_image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=1200&q=80",
    category: "趨勢分析",
    tags: ["AI Image", "Diffusion"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    reading_time: 8,
    views: 3120,
    is_featured: false,
    is_published: true,
  },
  {
    id: "a5",
    slug: "open-source-llm-2026",
    title: "開源 LLM 大爆發：Llama / Qwen / DeepSeek 之爭",
    excerpt:
      "三大開源模型陣營策略差異越拉越大，選擇哪個模型訓練內部 agent？",
    cover_image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    category: "趨勢分析",
    tags: ["Open Source", "LLM"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    reading_time: 9,
    views: 2870,
    is_featured: false,
    is_published: true,
  },
  {
    id: "a6",
    slug: "ai-coding-agents-comparison",
    title: "AI Coding Agents 對決：Cursor vs Claude Code vs Copilot",
    excerpt:
      "三大 coding agent 使用的 workflow 有何差異？實測十個常見任務。",
    cover_image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    category: "AI 工具",
    tags: ["Coding", "Cursor", "Claude"],
    author: "Editorial Team",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reading_time: 12,
    views: 4210,
    is_featured: false,
    is_published: true,
  },
];

export const MOCK_TOOLS: Tool[] = [
  {
    id: "t1",
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "最普及的對話式 AI",
    description:
      "OpenAI 旗艦對話模型，內建瀏覽、code interpreter、圖像生成等多種 tool。",
    logo: "https://cdn.openai.com/API/logo-openai.svg",
    website: "https://chat.openai.com",
    category: "writing",
    rating: 4.8,
    pricing: "freemium",
    is_trending: true,
  },
  {
    id: "t2",
    slug: "claude",
    name: "Claude",
    tagline: "強推理 + 長 context",
    description:
      "Anthropic 推出的 LLM，特別擅長長文件、code 與細膩對話。",
    logo: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&q=80",
    website: "https://claude.ai",
    category: "writing",
    rating: 4.8,
    pricing: "freemium",
    is_trending: true,
  },
  {
    id: "t3",
    slug: "midjourney",
    name: "Midjourney",
    tagline: "美學最強 AI 生圖",
    description: "風格化 AI 生圖工具，特別啱做品牌、海報、概念圖。",
    logo: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&q=80",
    website: "https://midjourney.com",
    category: "image",
    rating: 4.7,
    pricing: "paid",
    is_trending: true,
  },
  {
    id: "t4",
    slug: "runway",
    name: "Runway",
    tagline: "AI 影片生成 + 編輯",
    description:
      "Gen-3 + 強大影片編輯 suite，從 text-to-video 到後製都做到。",
    logo: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&q=80",
    website: "https://runwayml.com",
    category: "video",
    rating: 4.6,
    pricing: "freemium",
    is_trending: true,
  },
  {
    id: "t5",
    slug: "cursor",
    name: "Cursor",
    tagline: "AI 原生 code editor",
    description: "VS Code fork，深度整合 LLM，最啱 Vibe Coding。",
    logo: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=200&q=80",
    website: "https://cursor.com",
    category: "coding",
    rating: 4.7,
    pricing: "freemium",
    is_trending: true,
  },
  {
    id: "t6",
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "工作流 AI 助手",
    description: "Notion 內建 AI，總結、寫作、知識搜尋一條龍。",
    logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=200&q=80",
    website: "https://notion.so",
    category: "productivity",
    rating: 4.5,
    pricing: "paid",
    is_trending: false,
  },
  {
    id: "t7",
    slug: "perplexity",
    name: "Perplexity",
    tagline: "AI 答問引擎",
    description: "結合 search + LLM，回答問題時同步附上引用來源，研究神器。",
    logo: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=200&q=80",
    website: "https://perplexity.ai",
    category: "productivity",
    rating: 4.6,
    pricing: "freemium",
    is_trending: true,
  },
  {
    id: "t8",
    slug: "v0",
    name: "v0",
    tagline: "Text-to-UI 神器",
    description: "Vercel 出品，由文字直接 generate Next.js + Tailwind UI。",
    logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&q=80",
    website: "https://v0.dev",
    category: "coding",
    rating: 4.5,
    pricing: "freemium",
    is_trending: false,
  },
];

export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: "tu1",
    slug: "chatgpt-getting-started",
    title: "點樣用 ChatGPT：新手 10 分鐘快速上手",
    level: "新手",
    duration: "10 分鐘",
    cover_image:
      "https://images.unsplash.com/photo-1693673088901-fd75e0fdb43d?w=1200&q=80",
    excerpt: "由帳號設定到 prompt 技巧，一文掌握 ChatGPT 基本功。",
  },
  {
    id: "tu2",
    slug: "free-ai-tools-2026",
    title: "免費 AI 工具推薦：2026 必試 12 個",
    level: "新手",
    duration: "12 分鐘",
    cover_image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    excerpt: "完全免費，學生、freelancer 都用得，覆蓋寫作、生圖、剪片。",
  },
  {
    id: "tu3",
    slug: "ai-for-students",
    title: "學生必備 AI：寫 essay、做 research、整 slide",
    level: "新手",
    duration: "15 分鐘",
    cover_image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80",
    excerpt: "不是鼓勵作弊，而是教您如何以 AI 提升學習與作業質素。",
  },
  {
    id: "tu4",
    slug: "ai-automation-no-code",
    title: "AI 自動化教學：n8n + Claude 整 personal assistant",
    level: "中級",
    duration: "25 分鐘",
    cover_image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
    excerpt: "0 行 code，每朝自動 brief 你新聞、Calendar、Email。",
  },
];

import crypto from "node:crypto";
import { audit, pipelineDb } from "./db";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "pipeline-draft" });

type RawItemForDraft = {
  id: string;
  source_id: string;
  external_id: string | null;
  url: string;
  title: string;
  summary: string | null;
  author: string | null;
  published_at: string | null;
  language: string | null;
  raw_metadata: Record<string, unknown> | null;
};

type DraftResponse = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
};

export type DraftStats = {
  considered: number;
  drafted: number;
  skipped: number;
  failed: number;
  durationMs: number;
};

function requireOpenAIConfig() {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !model) {
    throw new Error("Missing OPENAI_API_KEY or OPENAI_MODEL");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    model,
  };
}

function normalizeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

function createDraftSlug(title: string, url: string, publishedAt?: string | null) {
  const date = publishedAt ? new Date(publishedAt) : new Date();
  const datePart = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
  const titlePart = normalizeSlug(title);
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `${datePart}-${titlePart || "ai-news"}-${hash}`;
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = Array.from(content).filter((char) => {
    const code = char.charCodeAt(0);
    return code >= 0x2e80 && code <= 0x9fff;
  }).length;
  return Math.max(1, Math.ceil(Math.max(words / 220, cjkChars / 450)));
}

function extractJson(text: string): DraftResponse {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model response did not contain JSON");
    return JSON.parse(match[0]);
  }
}

function normalizeDraft(value: DraftResponse): DraftResponse {
  const tags = Array.isArray(value.tags)
    ? value.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 6)
    : [];

  return {
    title: String(value.title || "").trim(),
    excerpt: String(value.excerpt || "").trim(),
    content: String(value.content || "").trim(),
    category: String(value.category || "AI News").trim(),
    tags,
  };
}

async function generateDraft(rawItem: RawItemForDraft): Promise<DraftResponse> {
  const { baseUrl, apiKey, model } = requireOpenAIConfig();
  const sourceName = String(rawItem.raw_metadata?.source_name || "Unknown source");
  const sourceTags = Array.isArray(rawItem.raw_metadata?.source_tags)
    ? rawItem.raw_metadata?.source_tags
    : [];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是 AI Radar Hub 的資深 AI 新聞編輯。請只輸出 JSON，不要 Markdown fence。文字必須使用繁體中文，語氣清晰、專業、有洞察，但不可捏造原文沒有的事實。",
        },
        {
          role: "user",
          content: JSON.stringify({
            task:
              "根據來源資料產生一篇可由人工審核的新聞草稿。請輸出欄位：title, excerpt, content, category, tags。content 用 Markdown，包含 3-5 個小標，文末附上來源連結。",
            source: {
              name: sourceName,
              tags: sourceTags,
              url: rawItem.url,
              language: rawItem.language,
            },
            item: {
              title: rawItem.title,
              summary: rawItem.summary,
              author: rawItem.author,
              published_at: rawItem.published_at,
              external_id: rawItem.external_id,
            },
            constraints: {
              title: "32 字以內，繁體中文",
              excerpt: "80-140 字，繁體中文",
              content: "800-1200 字，繁體中文 Markdown",
              category:
                "從 AI 新聞, AI 研究, AI 工具, AI 商業, AI 政策, AI 安全, 開源 AI 中選一個",
              tags: "3-6 個短標籤",
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI-compatible API failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI-compatible API returned no content");

  const draft = normalizeDraft(extractJson(content));
  if (!draft.title || !draft.excerpt || !draft.content) {
    throw new Error("Draft response is missing title, excerpt, or content");
  }
  return draft;
}

async function markProcessed(id: string, status: "drafted" | "skipped" | "failed") {
  const { error } = await pipelineDb()
    .from("raw_items")
    .update({ processed_at: new Date().toISOString(), status })
    .eq("id", id);
  if (error) throw error;
}

export async function runDraftGeneration(limit = Number(process.env.NEWS_DRAFT_LIMIT || 5)): Promise<DraftStats> {
  const startedAt = Date.now();
  await audit("system:draft", "run.start", undefined, undefined, { limit });

  const { data, error } = await pipelineDb()
    .from("raw_items")
    .select("id, source_id, external_id, url, title, summary, author, published_at, language, raw_metadata")
    .is("processed_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("fetched_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const items = (data ?? []) as RawItemForDraft[];
  let drafted = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const { data: existing, error: existingError } = await pipelineDb()
        .from("articles")
        .select("id")
        .eq("source_url", item.url)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing) {
        await markProcessed(item.id, "skipped");
        skipped += 1;
        continue;
      }

      const draft = await generateDraft(item);
      const publishedAt = item.published_at || new Date().toISOString();
      const slug = createDraftSlug(draft.title, item.url, publishedAt);

      const { data: article, error: insertError } = await pipelineDb()
        .from("articles")
        .insert({
          slug,
          title: draft.title,
          title_zh: draft.title,
          excerpt: draft.excerpt,
          excerpt_zh: draft.excerpt,
          content: draft.content,
          content_zh: draft.content,
          summary_content: draft.excerpt,
          summary_content_zh: draft.excerpt,
          category: draft.category,
          tags: draft.tags,
          author: "AI Radar",
          source_url: item.url,
          source_name: String(item.raw_metadata?.source_name || "RSS"),
          language: "zh-Hant",
          review_status: "pending",
          is_ai_generated: true,
          is_published: false,
          is_featured: false,
          is_premium: false,
          published_at: publishedAt,
          reading_time: estimateReadingTime(draft.content),
          views: 0,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const { error: updateError } = await pipelineDb()
        .from("raw_items")
        .update({
          processed_at: new Date().toISOString(),
          status: "drafted",
          raw_metadata: {
            ...(item.raw_metadata ?? {}),
            article_id: article?.id,
          },
        })
        .eq("id", item.id);

      if (updateError) throw updateError;
      drafted += 1;
      log.info({ rawItemId: item.id, articleId: article?.id }, "draft created");
    } catch (error) {
      failed += 1;
      log.warn({ err: error, rawItemId: item.id }, "draft generation failed");
      await markProcessed(item.id, "failed");
      await audit("system:draft", "item.error", "raw_item", item.id, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const durationMs = Date.now() - startedAt;
  const stats = { considered: items.length, drafted, skipped, failed, durationMs };

  await audit("system:draft", "run.complete", undefined, undefined, {
    considered: items.length,
    drafted,
    skipped,
    failed,
    duration_ms: durationMs,
  });

  return stats;
}

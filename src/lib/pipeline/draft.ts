import crypto from "node:crypto";
import { audit, pipelineDb } from "./db";
import { containsHan, hanRatio } from "./draft-validation";
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
  reading_time: number;
};

type DraftLanguage = "zh" | "en";

type ExistingArticleForDraft = {
  id: string;
  title_zh: string | null;
  title_en: string | null;
  excerpt_zh: string | null;
  excerpt_en: string | null;
  content_zh: string | null;
  content_en: string | null;
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

function createDraftSlug(sourceTitle: string, url: string, publishedAt?: string | null) {
  const date = publishedAt ? new Date(publishedAt) : new Date();
  const datePart = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
  const titlePart = normalizeSlug(sourceTitle);
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
  const readingTime = Number(value.reading_time);

  return {
    title: String(value.title || "").trim(),
    excerpt: String(value.excerpt || "").trim(),
    content: String(value.content || "").trim(),
    category: String(value.category || "AI News").trim(),
    tags,
    reading_time: Number.isFinite(readingTime) && readingTime > 0 ? Math.ceil(readingTime) : 0,
  };
}

function validateDraftLanguage(draft: DraftResponse, language: DraftLanguage) {
  if (language !== "en") return;
  validateEnglishDraft(draft);
}

function validateEnglishDraft(draft: DraftResponse) {
  const tagsText = (draft.tags ?? []).join(" ");
  const invalid =
    hanRatio(draft.title) !== 0 ||
    hanRatio(draft.excerpt) !== 0 ||
    hanRatio(draft.content) >= 0.01 ||
    containsHan(draft.category) ||
    containsHan(tagsText);

  if (invalid) {
    throw new Error("ENGLISH_OUTPUT_CONTAINS_CHINESE");
  }
}

function getLanguageInstructions(language: DraftLanguage) {
  if (language === "zh") {
    return {
      language,
      languageName: "Traditional Chinese",
      languageInstruction:
        "Write title, excerpt, content, category, and tags in Traditional Chinese. Keep section headings exactly as specified in English.",
      categoryInstruction:
        "category must be one of: AI 新聞, AI 研究, AI 工具, AI 商業, AI 政策, AI 安全, 開源 AI.",
    };
  }

  return {
    language,
    languageName: "English",
    languageInstruction:
      "Write title, excerpt, content, category, and tags in polished English. Keep section headings exactly as specified.",
    categoryInstruction:
      "category must be one of: AI News, AI Research, AI Tools, AI Business, AI Policy, AI Safety, Open Source AI.",
  };
}

async function generateDraftOnce(
  rawItem: RawItemForDraft,
  language: DraftLanguage,
  retryReason?: string
): Promise<DraftResponse> {
  const { baseUrl, apiKey, model } = requireOpenAIConfig();
  const sourceName = String(rawItem.raw_metadata?.source_name || "Unknown source");
  const sourceTags = Array.isArray(rawItem.raw_metadata?.source_tags)
    ? rawItem.raw_metadata?.source_tags
    : [];
  const languageInstructions = getLanguageInstructions(language);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            language === "en"
              ? [
                  "You are an English-language technology journalist.",
                  "You must write only in English.",
                  "Chinese characters are forbidden.",
                  "If the source contains Chinese, translate and rewrite it into natural English.",
                  "Return valid JSON only.",
                  "Every value in title, excerpt, content, category, and tags must be English.",
                ].join("\n")
              : [
                  "You are the senior AI news editor for AI Radar Hub.",
                  "Return valid JSON only. Do not wrap the JSON in Markdown fences.",
                  "Write in a professional magazine style that is SEO friendly.",
                  "The article content field must contain Markdown.",
                  "Do not hallucinate facts. If the source does not provide a detail, do not invent it.",
                  "Keep citations, named sources, links, and attribution that appear in the source material.",
                  "This is the zh prompt. Every generated field must be Traditional Chinese, except the required Markdown section headings.",
                  languageInstructions.languageInstruction,
                ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Create one AI Radar Hub article draft from this source item.",
            target_language_code: languageInstructions.language,
            target_language: languageInstructions.languageName,
            output_json_schema: {
              title: "",
              excerpt: "",
              content: "",
              category: "",
              tags: [],
              reading_time: 0,
            },
            content_markdown_format: [
              "# {title}",
              "",
              "## TL;DR",
              "",
              "Provide a one-sentence summary.",
              "",
              "---",
              "",
              "## Why it matters",
              "",
              "Explain why this development matters.",
              "",
              "---",
              "",
              "## What happened",
              "",
              "Summarize the factual event.",
              "",
              "---",
              "",
              "## AI Radar Analysis",
              "",
              "Provide our own interpretation and implications.",
              "",
              "---",
              "",
              "## Key Takeaways",
              "",
              "* item 1",
              "* item 2",
              "* item 3",
              "",
              "---",
              "",
              "Source:",
              "{original source url}",
            ].join("\n"),
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
            requirements: [
              retryReason || "",
              "Output exactly the JSON object described by output_json_schema.",
              "content must follow content_markdown_format exactly, including headings, separators, bullet list, and Source section.",
              "The first Markdown heading must be # {title}, where {title} equals the JSON title.",
              "The Markdown content must include ## TL;DR, ## Why it matters, ## What happened, ## AI Radar Analysis, ## Key Takeaways, and Source sections.",
              language === "en"
                ? "English validation requirement: title, excerpt, content, category, and tags must be English, not Chinese."
                : "Traditional Chinese validation requirement: title, excerpt, content, category, and tags must be Traditional Chinese.",
              "The Source section must include the original source URL exactly.",
              "Keep any citations, links, named reports, publications, companies, people, and dates provided in the source item.",
              "Do not add facts, numbers, quotes, product claims, dates, or citations that are not supported by the source item.",
              languageInstructions.categoryInstruction,
              "tags must contain 3-6 concise SEO-friendly tags.",
              "reading_time must be an integer number of minutes based on the Markdown content length.",
            ],
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
  validateDraftLanguage(draft, language);
  return draft;
}

async function generateDraft(rawItem: RawItemForDraft, language: DraftLanguage): Promise<DraftResponse> {
  try {
    return await generateDraftOnce(rawItem, language);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (language !== "en" || message !== "ENGLISH_OUTPUT_CONTAINS_CHINESE") {
      throw error;
    }

    log.warn({ rawItemId: rawItem.id, language, reason: message }, "retrying invalid English draft");
    return generateDraftOnce(
      rawItem,
      language,
      "Your previous output contained Chinese. Rewrite the same article in English only."
    );
  }
}

async function generateZhDraft(rawItem: RawItemForDraft) {
  return generateDraft(rawItem, "zh");
}

async function generateEnglishDraft(rawItem: RawItemForDraft) {
  return generateDraft(rawItem, "en");
}

function hasDraftLanguage(article: ExistingArticleForDraft | null, language: DraftLanguage) {
  if (!article) return false;
  if (language === "zh") {
    return Boolean(article.title_zh && article.excerpt_zh && article.content_zh);
  }
  if (!article.title_en || !article.excerpt_en || !article.content_en) return false;
  try {
    validateEnglishDraft({
      title: article.title_en,
      excerpt: article.excerpt_en,
      content: article.content_en,
      category: "AI News",
      tags: [],
      reading_time: 1,
    });
    return true;
  } catch {
    return false;
  }
}

function mergeTags(...tagSets: Array<string[] | null | undefined>) {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const tagSet of tagSets) {
    for (const tag of tagSet ?? []) {
      const normalized = String(tag).trim();
      const key = normalized.toLowerCase();
      if (!normalized || seen.has(key)) continue;
      seen.add(key);
      tags.push(normalized);
    }
  }

  return tags.slice(0, 8);
}

function preview(value: string | null | undefined) {
  return String(value || "").replace(/\s+/g, " ").slice(0, 120);
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
      const { data: existingRows, error: existingError } = await pipelineDb()
        .from("articles")
        .select("id, title_zh, title_en, excerpt_zh, excerpt_en, content_zh, content_en")
        .eq("source_url", item.url)
        .order("created_at", { ascending: true })
        .limit(1);

      if (existingError) throw existingError;

      const existingArticle = ((existingRows ?? [])[0] ?? null) as ExistingArticleForDraft | null;
      const missingLanguages: DraftLanguage[] = (["zh", "en"] as const).filter(
        (language) => !hasDraftLanguage(existingArticle, language)
      );

      if (missingLanguages.length === 0) {
        await markProcessed(item.id, "skipped");
        skipped += 1;
        continue;
      }

      const publishedAt = item.published_at || new Date().toISOString();
      const drafts: Partial<Record<DraftLanguage, DraftResponse>> = {};

      if (missingLanguages.includes("zh")) {
        drafts.zh = await generateZhDraft(item);
      }

      if (missingLanguages.includes("en")) {
        drafts.en = await generateEnglishDraft(item);
      }

      const zhDraft = drafts.zh;
      const enDraft = drafts.en;
      const readingTime = Math.max(
        zhDraft?.reading_time || (zhDraft ? estimateReadingTime(zhDraft.content) : 0),
        enDraft?.reading_time || (enDraft ? estimateReadingTime(enDraft.content) : 0),
        1
      );
      const sharedCategory = enDraft?.category || zhDraft?.category || "AI News";
      const sharedTags = enDraft?.tags?.length ? enDraft.tags : mergeTags(zhDraft?.tags, enDraft?.tags);
      const finalTitleZh = zhDraft?.title ?? existingArticle?.title_zh ?? null;
      const finalTitleEn = enDraft?.title ?? existingArticle?.title_en ?? null;
      const finalExcerptEn = enDraft?.excerpt ?? existingArticle?.excerpt_en ?? null;
      const finalContentEn = enDraft?.content ?? existingArticle?.content_en ?? null;

      const debugPayload = {
        rawItemId: item.id,
        title_zh_preview: preview(finalTitleZh),
        title_en_preview: preview(finalTitleEn),
        chineseRatio_title_en: hanRatio(finalTitleEn || ""),
        chineseRatio_content_en: hanRatio(finalContentEn || ""),
      };
      console.info("[pipeline-draft] before save", debugPayload);
      log.info(debugPayload, "before saving bilingual draft");
      await audit("system:draft", "item.before_save", "raw_item", item.id, debugPayload);

      if (!finalTitleEn || !finalExcerptEn || !finalContentEn) {
        throw new Error("ENGLISH_OUTPUT_MISSING");
      }

      validateEnglishDraft({
        title: finalTitleEn,
        excerpt: finalExcerptEn,
        content: finalContentEn,
        category: sharedCategory,
        tags: sharedTags,
        reading_time: 1,
      });

      const payload = {
        ...(zhDraft
          ? {
              title: zhDraft.title,
              title_zh: zhDraft.title,
              excerpt: zhDraft.excerpt,
              excerpt_zh: zhDraft.excerpt,
              content: zhDraft.content,
              content_zh: zhDraft.content,
              summary_content: zhDraft.excerpt,
              summary_content_zh: zhDraft.excerpt,
            }
          : {}),
        ...(enDraft
          ? {
              title_en: enDraft.title,
              excerpt_en: enDraft.excerpt,
              content_en: enDraft.content,
            }
          : {}),
        category: sharedCategory,
        tags: sharedTags,
        author: "AI Radar",
        source_url: item.url,
        source_name: String(item.raw_metadata?.source_name || "RSS"),
        language: "zh-Hant,en",
        review_status: "pending",
        is_ai_generated: true,
        is_published: false,
        is_featured: false,
        is_premium: false,
        published_at: publishedAt,
        reading_time: readingTime,
        views: 0,
        updated_at: new Date().toISOString(),
      };

      const { data: article, error: articleError } = existingArticle
        ? await pipelineDb()
            .from("articles")
            .update(payload)
            .eq("id", existingArticle.id)
            .select("id")
            .single()
        : await pipelineDb()
            .from("articles")
            .insert({
              slug: createDraftSlug(item.title, item.url, publishedAt),
              title: zhDraft?.title || enDraft?.title || item.title,
              excerpt: zhDraft?.excerpt || enDraft?.excerpt || item.summary || "",
              content: zhDraft?.content || enDraft?.content || null,
              summary_content: zhDraft?.excerpt || enDraft?.excerpt || item.summary || null,
              ...payload,
            })
            .select("id")
            .single();

      if (articleError) throw articleError;

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
      drafted += article?.id ? 1 : 0;
      log.info({ rawItemId: item.id, articleId: article?.id }, "bilingual draft saved");
    } catch (error) {
      failed += 1;
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === "ENGLISH_OUTPUT_CONTAINS_CHINESE") {
        console.error("ENGLISH_OUTPUT_CONTAINS_CHINESE", { rawItemId: item.id });
        log.error({ err: error, rawItemId: item.id }, "ENGLISH_OUTPUT_CONTAINS_CHINESE");
      } else {
        log.warn({ err: error, rawItemId: item.id }, "draft generation failed");
      }
      await markProcessed(item.id, "failed");
      await audit("system:draft", "item.error", "raw_item", item.id, {
        error: errorMessage,
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

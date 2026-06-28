import type { ToolCategorySlug } from "@/lib/site";

// ============ Public-facing ============

export type Article = {
  id: string;
  slug: string;
  title: string;
  title_zh?: string | null;
  title_en?: string | null;
  excerpt: string;
  excerpt_zh?: string | null;
  excerpt_en?: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published_at: string;
  reading_time: number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  is_premium?: boolean;
  language?: string | null;
  review_status?: "pending" | "approved" | "rejected" | null;
  /** Markdown 內容 */
  content?: string | null;
  content_zh?: string | null;
  content_en?: string | null;
  content_html?: string | null;
  summary_content?: string | null;
  summary_content_zh?: string | null;
  /** Email-optimized HTML body for newsletter sends */
  email_content?: string | null;
};

export type Tool = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
  category: Exclude<ToolCategorySlug, "all">;
  rating: number;
  pricing: "free" | "freemium" | "paid";
  is_trending: boolean;
};

export type Tutorial = {
  id: string;
  slug: string;
  title: string;
  level: "新手" | "中級" | "進階";
  duration: string;
  cover_image: string;
  excerpt: string;
  content?: string;
  is_published?: boolean;
};

export type NewsletterSubscriber = {
  email: string;
  subscribed_at: string;
};

// ============ Pipeline ============

export type SourceKind =
  | "rss"
  | "reddit"
  | "hn"
  | "arxiv"
  | "github_trending"
  | "scrape";

export type Source = {
  id: string;
  name: string;
  kind: SourceKind;
  url: string;
  authority: number;
  language: string;
  tags: string[];
  is_enabled: boolean;
  config: Record<string, unknown>;
  last_fetched_at: string | null;
  last_error: string | null;
  created_at: string;
};

export type RawItem = {
  id: string;
  source_id: string;
  external_id: string | null;
  url: string;
  title: string;
  summary: string | null;
  author: string | null;
  published_at: string | null;
  fetched_at: string;
  language: string;
  raw_metadata: Record<string, unknown>;
  status: "new" | "scored" | "drafted" | "skipped";
  processed_at?: string | null;
};

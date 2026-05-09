import type { ToolCategorySlug } from "@/lib/site";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string[];
  author: string;
  published_at: string; // ISO
  reading_time: number; // minutes
  views: number;
  is_featured: boolean;
  is_published: boolean;
  /** Markdown 內容 */
  content?: string;
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
  rating: number; // 0–5
  pricing: "free" | "freemium" | "paid";
  is_trending: boolean;
};

export type Tutorial = {
  id: string;
  slug: string;
  title: string;
  level: "新手" | "中級" | "進階";
  duration: string; // e.g. "10 分鐘"
  cover_image: string;
  excerpt: string;
  content?: string;
  is_published?: boolean;
};

export type NewsletterSubscriber = {
  email: string;
  subscribed_at: string;
};

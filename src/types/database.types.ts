/**
 * Permissive Database shape for Supabase clients.
 * Each table is enumerated by name so TS can resolve `.from('x')` correctly,
 * but per-row payloads are typed `any` for now.
 *
 * TODO: Replace with `npx supabase gen types typescript` output later.
 */
export type Database = {
  public: {
    Tables: {
      sources: { Row: any; Insert: any; Update: any };
      raw_items: { Row: any; Insert: any; Update: any };
      audit_logs: { Row: any; Insert: any; Update: any };
      threads: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          image_url: string | null;
          link_url: string | null;
          link_title: string | null;
          link_description: string | null;
          link_image: string | null;
          is_bot_post: boolean;
          like_count: number;
          comment_count: number;
          created_at: string;
        };
        Insert: {
          author_id: string;
          content: string;
          image_url?: string | null;
          link_url?: string | null;
          link_title?: string | null;
          link_description?: string | null;
          link_image?: string | null;
          is_bot_post?: boolean;
        };
        Update: {
          content?: string;
          image_url?: string | null;
          link_url?: string | null;
          link_title?: string | null;
          link_description?: string | null;
          link_image?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      source_kind:
        | "rss"
        | "reddit"
        | "hn"
        | "arxiv"
        | "github_trending"
        | "scrape";
    };
    CompositeTypes: Record<string, never>;
  };
};

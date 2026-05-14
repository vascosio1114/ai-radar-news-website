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
      thread_comments: {
        Row: {
          id: string;
          thread_id: string;
          parent_comment_id: string | null;
          author_id: string;
          content: string;
          is_bot_comment: boolean;
          like_count: number;
          created_at: string;
        };
        Insert: {
          thread_id: string;
          parent_comment_id?: string | null;
          author_id: string;
          content: string;
          is_bot_comment?: boolean;
        };
        Update: {
          content?: string;
        };
      };
      comment_likes: {
        Row: {
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          comment_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
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

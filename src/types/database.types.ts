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

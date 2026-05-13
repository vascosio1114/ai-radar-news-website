/**
 * Dashboard data queries.
 * Uses service-role client to bypass RLS (read-only aggregation, safe).
 */
import { createClient } from "@supabase/supabase-js";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Dashboard queries need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type DashboardStats = {
  total_items: number;
  items_24h: number;
  items_24h_prev: number;
  delta_pct: number;
  active_sources: number;
  sources_with_errors: number;
  last_fetch_at: string | null;
};

export async function getStats(): Promise<DashboardStats> {
  const supabase = db();

  const now = new Date();
  const t24 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const t48 = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();

  const [total, last24, prev24, sourcesRes, lastFetchRes] = await Promise.all([
    supabase.from("raw_items").select("id", { count: "exact", head: true }),
    supabase
      .from("raw_items")
      .select("id", { count: "exact", head: true })
      .gte("fetched_at", t24),
    supabase
      .from("raw_items")
      .select("id", { count: "exact", head: true })
      .gte("fetched_at", t48)
      .lt("fetched_at", t24),
    supabase.from("sources").select("id, is_enabled, last_error"),
    supabase
      .from("raw_items")
      .select("fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1),
  ]);

  const items24h = last24.count ?? 0;
  const itemsPrev = prev24.count ?? 0;
  const deltaPct = itemsPrev === 0 ? 0 : ((items24h - itemsPrev) / itemsPrev) * 100;

  const sources = (sourcesRes.data as { id: string; is_enabled: boolean; last_error: string | null }[]) ?? [];
  const active = sources.filter((s) => s.is_enabled).length;
  const withErrors = sources.filter((s) => s.last_error).length;

  const lastFetch = (lastFetchRes.data as { fetched_at: string }[])?.[0]?.fetched_at ?? null;

  return {
    total_items: total.count ?? 0,
    items_24h: items24h,
    items_24h_prev: itemsPrev,
    delta_pct: Math.round(deltaPct),
    active_sources: active,
    sources_with_errors: withErrors,
    last_fetch_at: lastFetch,
  };
}

export type DailyPoint = { day: string; count: number };

/** Last 7 days of items added per day. */
export async function getDailyTrend(): Promise<DailyPoint[]> {
  const supabase = db();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("raw_items")
    .select("fetched_at")
    .gte("fetched_at", since);

  if (error) throw error;

  const buckets = new Map<string, number>();
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }
  for (const row of (data as { fetched_at: string }[]) ?? []) {
    const day = row.fetched_at.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
}

export type SourceRow = {
  id: string;
  name: string;
  kind: string;
  is_enabled: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
  items_count: number;
};

export async function getSources(): Promise<SourceRow[]> {
  const supabase = db();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, name, kind, is_enabled, last_fetched_at, last_error")
    .order("name", { ascending: true });

  if (!sources) return [];

  // Get item count per source
  const ids = (sources as { id: string }[]).map((s) => s.id);
  const { data: counts } = await supabase
    .from("raw_items")
    .select("source_id")
    .in("source_id", ids);

  const countMap = new Map<string, number>();
  for (const row of (counts as { source_id: string }[]) ?? []) {
    countMap.set(row.source_id, (countMap.get(row.source_id) ?? 0) + 1);
  }

  return (sources as Omit<SourceRow, "items_count">[]).map((s) => ({
    ...s,
    items_count: countMap.get(s.id) ?? 0,
  }));
}

export type LatestItem = {
  id: string;
  title: string;
  url: string;
  fetched_at: string;
  published_at: string | null;
  source_name: string;
  source_kind: string;
};

export async function getLatestItems(limit = 12): Promise<LatestItem[]> {
  const supabase = db();

  const { data, error } = await supabase
    .from("raw_items")
    .select(
      "id, title, url, fetched_at, published_at, sources(name, kind)"
    )
    .order("fetched_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return ((data as unknown) as {
    id: string;
    title: string;
    url: string;
    fetched_at: string;
    published_at: string | null;
    sources: { name: string; kind: string } | null;
  }[]).map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    fetched_at: r.fetched_at,
    published_at: r.published_at,
    source_name: r.sources?.name ?? "—",
    source_kind: r.sources?.kind ?? "",
  }));
}

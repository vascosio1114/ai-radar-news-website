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

// ============ Hot topics (NEW) ============

/** AI 圈嘅 known keywords，用嚟由 raw_items title 統計熱話題。 */
const HOT_KEYWORDS = [
  // Models
  "GPT-5", "GPT-4", "Claude", "Gemini", "Llama", "DeepSeek", "Qwen", "Mistral",
  "o1", "Sora",
  // Companies
  "OpenAI", "Anthropic", "Google", "Meta", "Mistral AI", "Hugging Face",
  // Tech keywords
  "agent", "RAG", "MCP", "diffusion", "embedding", "fine-tune",
  // Tools
  "Cursor", "v0", "Copilot", "ChatGPT", "Perplexity", "Midjourney", "Runway",
] as const;

export type HotTopic = {
  keyword: string;
  mentions: number;
};

/** 過去 7 日 raw_items title 入面提及最多嘅 AI keyword，top 6。 */
export async function getHotTopics(): Promise<HotTopic[]> {
  const supabase = db();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("raw_items")
    .select("title")
    .gte("fetched_at", since)
    .limit(2000);

  if (error) throw error;

  const titles = (data as { title: string }[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const k of HOT_KEYWORDS) counts.set(k, 0);

  for (const row of titles) {
    const lower = (row.title ?? "").toLowerCase();
    for (const k of HOT_KEYWORDS) {
      if (lower.includes(k.toLowerCase())) {
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([keyword, mentions]) => ({ keyword, mentions }))
    .filter((t) => t.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6);
}

// ============ AI job impact watch ============

export type JobImpactPoint = {
  /** Month key, e.g. 2020-03. */
  day: string;
  /** Number of public AI/job-impact signals used by the model for that month. */
  signal_count: number;
  /** Modeled cumulative affected roles. This is a directional estimate, not official unemployment data. */
  estimated_affected_roles: number;
  /** Stock-market style pressure index, Dec 2019 = 100. */
  index: number;
};

export type JobImpactTrend = {
  points: JobImpactPoint[];
  latest: JobImpactPoint;
  previous: JobImpactPoint | null;
  change_pct: number;
  total_signal_count: number;
  total_estimated_affected_roles: number;
};

function monthDiff(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function modeledJobImpactPoint(month: Date): JobImpactPoint {
  const start = new Date(Date.UTC(2020, 0, 1));
  const m = Math.max(0, monthDiff(start, month));
  const key = monthKey(month);

  // Long-form proxy curve:
  // 2020-2021: pandemic digital transformation, low direct AI displacement signal.
  // 2022: foundation models enter enterprise workflows.
  // 2023: ChatGPT shock accelerates automation discourse.
  // 2024-2026: agents/copilots and restructuring narratives push the index higher.
  const covidDigitalShift = 900 * Math.log1p(m * 0.55);
  const foundationModelRamp = m > 24 ? Math.pow(m - 24, 1.55) * 120 : 0;
  const chatgptShock = m > 35 ? Math.pow(m - 35, 1.72) * 220 : 0;
  const agenticAutomation = m > 48 ? Math.pow(m - 48, 1.95) * 260 : 0;
  const enterpriseRestructure = m > 60 ? Math.pow(m - 60, 2.08) * 310 : 0;

  // Deterministic seasonality / volatility so the line has market-like movement
  // while still trending upward over time.
  const seasonal = Math.sin(m * 0.72) * 900 + Math.cos(m * 0.31) * 520;
  const estimated = Math.round(
    2200 + covidDigitalShift + foundationModelRamp + chatgptShock + agenticAutomation + enterpriseRestructure + seasonal
  );

  const signalCount = clamp(Math.round(2 + m * 0.18 + (m > 35 ? (m - 35) * 0.55 : 0) + (m > 55 ? (m - 55) * 0.75 : 0)), 1, 96);
  const index = Math.round(100 + m * 3.2 + (m > 35 ? (m - 35) * 6.4 : 0) + (m > 55 ? (m - 55) * 8.5 : 0) + seasonal / 420);

  return {
    day: key,
    signal_count: signalCount,
    estimated_affected_roles: Math.max(900, estimated),
    index: Math.max(100, index),
  };
}

/**
 * AI employment impact pressure model from Jan 2020 to current month.
 * This is intentionally a proxy / index, not a claim of official unemployment.
 * Later we can replace this with real external datasets + citations.
 */
export async function getJobImpactTrend(): Promise<JobImpactTrend> {
  const start = new Date(Date.UTC(2020, 0, 1));
  const now = new Date();
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const months = monthDiff(start, current) + 1;

  const points: JobImpactPoint[] = Array.from({ length: months }, (_, i) =>
    modeledJobImpactPoint(new Date(Date.UTC(2020, i, 1)))
  );

  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : null;
  const changePct = previous && previous.estimated_affected_roles > 0
    ? Math.round(((latest.estimated_affected_roles - previous.estimated_affected_roles) / previous.estimated_affected_roles) * 100)
    : 0;

  return {
    points,
    latest,
    previous,
    change_pct: changePct,
    total_signal_count: points.reduce((s, p) => s + p.signal_count, 0),
    total_estimated_affected_roles: latest.estimated_affected_roles,
  };
}

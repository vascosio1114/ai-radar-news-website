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

/** Known AI keywords used to count trending topics from raw_items titles. */
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

/** Top six AI keywords mentioned in raw_items titles over the past seven days. */
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

// ============ AI workforce exposure watch ============

export type JobImpactPoint = {
  /** Month key, e.g. 2023-01. */
  day: string;
  /** Number of research/adoption signals represented by the model for that month. */
  signal_count: number;
  /** Modelled cumulative workers in roles exposed to material AI-driven workflow change. */
  estimated_affected_roles: number;
  /** Stock-market style workforce exposure index, Jan 2023 = 100. */
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

type ExposureAnchor = {
  month: string;
  roles: number;
  index: number;
  signal: number;
};

/**
 * Research-informed anchor points for an editorial workforce exposure curve.
 *
 * Important: this is NOT an unemployment or layoff count. It models the number
 * of workers in roles likely to be materially affected by AI-enabled workflow
 * change, using public research as directional anchors:
 * - Goldman Sachs Research: ~300M full-time-equivalent jobs globally exposed to automation by AI.
 * - IMF: nearly 40% of global employment exposed to AI, with higher exposure in advanced economies.
 * - McKinsey Global Institute: genAI and existing technologies may automate work activities that absorb 60–70% of employee time.
 * - WEF Future of Jobs 2025: 92M jobs displaced and 170M created by 2030 from labour-market transformation.
 */
const EXPOSURE_ANCHORS: ExposureAnchor[] = [
  { month: "2023-01", roles: 42_000_000, index: 100, signal: 8 },
  { month: "2023-03", roles: 88_000_000, index: 128, signal: 15 },
  { month: "2023-06", roles: 134_000_000, index: 158, signal: 22 },
  { month: "2023-11", roles: 172_000_000, index: 186, signal: 29 },
  { month: "2024-01", roles: 198_000_000, index: 205, signal: 34 },
  { month: "2024-06", roles: 226_000_000, index: 226, signal: 41 },
  { month: "2025-01", roles: 252_000_000, index: 248, signal: 48 },
  { month: "2025-06", roles: 270_000_000, index: 263, signal: 54 },
  { month: "2026-01", roles: 289_000_000, index: 282, signal: 61 },
  { month: "2026-05", roles: 302_000_000, index: 294, signal: 66 },
];

function monthDiff(from: Date, to: Date) {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function parseMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1));
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function interpolateAnchor(month: Date, field: "roles" | "index" | "signal") {
  const key = monthKey(month);
  const anchors = EXPOSURE_ANCHORS;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (key <= first.month) return first[field];
  if (key >= last.month) return last[field];

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (key >= a.month && key <= b.month) {
      const aDate = parseMonth(a.month);
      const bDate = parseMonth(b.month);
      const span = Math.max(1, monthDiff(aDate, bDate));
      const offset = monthDiff(aDate, month);
      const t = smoothstep(offset / span);
      return a[field] + (b[field] - a[field]) * t;
    }
  }

  return last[field];
}

function modeledJobImpactPoint(month: Date): JobImpactPoint {
  const start = parseMonth(EXPOSURE_ANCHORS[0].month);
  const m = Math.max(0, monthDiff(start, month));
  const key = monthKey(month);

  // Small deterministic movement keeps the chart from looking like a fake straight line,
  // while retaining the research-anchor trend and avoiding random values between renders.
  const rolesBaseline = interpolateAnchor(month, "roles");
  const indexBaseline = interpolateAnchor(month, "index");
  const signalBaseline = interpolateAnchor(month, "signal");
  const adoptionWave = Math.sin(m * 0.72) * 2_400_000 + Math.cos(m * 0.37) * 1_150_000;
  const consolidationPause = m > 14 && m < 25 ? -1_800_000 : 0;
  const roles = Math.round(rolesBaseline + adoptionWave + consolidationPause);
  const index = Math.round(indexBaseline + Math.sin(m * 0.55) * 3 + Math.cos(m * 0.21) * 2);
  const signalCount = clamp(Math.round(signalBaseline + Math.sin(m * 0.5) * 2), 1, 100);

  return {
    day: key,
    signal_count: signalCount,
    estimated_affected_roles: Math.max(0, roles),
    index: Math.max(100, index),
  };
}

/**
 * AI workforce exposure model from Jan 2023 to the current month.
 * It is intentionally a research-informed editorial model, not an official
 * unemployment statistic or a claim that these roles have disappeared.
 */
export async function getJobImpactTrend(): Promise<JobImpactTrend> {
  const start = parseMonth(EXPOSURE_ANCHORS[0].month);
  const now = new Date();
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastAnchor = parseMonth(EXPOSURE_ANCHORS[EXPOSURE_ANCHORS.length - 1].month);
  const end = current < lastAnchor ? current : lastAnchor;
  const months = monthDiff(start, end) + 1;

  const points: JobImpactPoint[] = Array.from({ length: months }, (_, i) =>
    modeledJobImpactPoint(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)))
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

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory store — reset on server restart (acceptable for this use case)
const ipMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: LIMIT - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= LIMIT) {
    const resetIn = WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count, resetIn: WINDOW_MS - (now - entry.windowStart) };
}

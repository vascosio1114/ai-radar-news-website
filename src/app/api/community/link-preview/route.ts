import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const communityLogger = logger.child({ component: "link-preview" });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Valid HTTP/HTTPS URL required" }, { status: 400 });
  }

  // SSRF protection: validate hostname before fetching
  try {
    const urlObj = new URL(url);
    if (isHostnameBlocked(urlObj.hostname)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Simple og: tag extraction via fetch + text parsing
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ title: null, description: null, image: null });
    }

    const html = await res.text();

    const getMeta = (prop: string): string | null => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m) return decodeHtmlEntities(m[1]);
      }
      return null;
    };

    const title = getMeta("og:title") ?? getMeta("twitter:title");
    const description = getMeta("og:description") ?? getMeta("twitter:description");
    const image = getMeta("og:image") ?? getMeta("twitter:image");

    return NextResponse.json({ title, description, image });
  } catch (e) {
    communityLogger.error({ err: e, url }, "Failed to fetch link preview");
    return NextResponse.json({ title: null, description: null, image: null });
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function isHostnameBlocked(hostname: string): boolean {
  const blocked = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    // AWS metadata
    "169.254.169.254",
    // Private ranges
  ];
  if (blocked.includes(hostname)) return true;
  // Check private IP ranges
  const ipv4Private = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;
  const ipv6Private = /^fe80:|::1|fc00:|fd00:/;
  if (ipv4Private.test(hostname) || ipv6Private.test(hostname)) return true;
  // Check if it's an IP literal (not a domain)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return false;
}
"use client";

import { useState, useEffect, useRef } from "react";
import { Eye } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

export default function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [loading, setLoading] = useState(true);
  const incremented = useRef(false);

  useEffect(() => {
    // Prevent double-increment in React strict mode
    if (incremented.current) return;
    incremented.current = true;

    async function incrementViews() {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase.rpc('increment_view_count', { p_article_slug: slug });
        setViews(initialViews + 1);
      } catch {
        // Silently fail — view count is non-critical
      } finally {
        setLoading(false);
      }
    }

    incrementViews();

    // Refresh view count every 30 seconds for live updates
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/articles/${slug}/view`, { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setViews(data.views);
        }
      } catch {
        // Silently fail
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [slug, initialViews]);

  return (
    <span className="inline-flex items-center gap-1">
      <Eye className="h-3.5 w-3.5" />
      {loading ? "..." : views.toLocaleString()}
    </span>
  );
}
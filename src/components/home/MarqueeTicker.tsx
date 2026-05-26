"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarqueeItem {
  label: string;
  value: string;
}

interface MarqueeTickerProps {
  items?: MarqueeItem[];
  className?: string;
}

const DEFAULT_ITEMS: MarqueeItem[] = [
  { label: "AI Articles", value: "300+" },
  { label: "Tools", value: "120+" },
  { label: "Updates", value: "Daily" },
  { label: "Readers", value: "50K+" },
];

const ITEM_SEPARATOR = "·";

function MarqueeStrip({
  items,
  separator,
}: {
  items: MarqueeItem[];
  separator: string;
}) {
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
              {item.value}
            </span>
            <span className="text-xs text-ink-500 dark:text-white/50">
              {item.label}
            </span>
          </span>
          {index < items.length - 1 && (
            <span className="mx-4 text-ink-300 dark:text-white/20">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

export const MarqueeTicker = React.memo(function MarqueeTicker({
  items = DEFAULT_ITEMS,
  className,
}: MarqueeTickerProps) {
  const separator = useMemo(() => ITEM_SEPARATOR, []);

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-ink-50/80 dark:bg-black/60",
        className
      )}
    >
      {/* Left fade mask */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-ink-50 to-transparent dark:from-black dark:to-transparent" />

      {/* Right fade mask */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-ink-50 to-transparent dark:from-black dark:to-transparent" />

      {/* Animated ticker */}
      <div
        className="pointer-events-none"
        style={{
          animation: "marquee-scroll 30s linear infinite",
          willChange: "transform",
        }}
      >
        <div className="flex">
          {/* First strip */}
          <div className="flex shrink-0 items-center px-8 py-3">
            <MarqueeStrip items={items} separator={separator} />
          </div>

          {/* Second strip (identical, creates seamless loop) */}
          <div className="flex shrink-0 items-center px-8 py-3">
            <MarqueeStrip items={items} separator={separator} />
          </div>
        </div>
      </div>

      {/* Keyframe definition */}
      <style>{`
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        .group:hover .pointer-events-none {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
});

MarqueeTicker.displayName = "MarqueeTicker";

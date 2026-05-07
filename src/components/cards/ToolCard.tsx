import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import type { Tool } from "@/types";

const PRICING_LABEL: Record<Tool["pricing"], string> = {
  free: "免費",
  freemium: "Freemium",
  paid: "付費",
};

const PRICING_STYLE: Record<Tool["pricing"], string> = {
  free: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  freemium: "bg-accent-500/10 text-accent-700 dark:text-accent-400",
  paid: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
      <div className="flex items-start justify-between">
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-ink-200/70 bg-ink-50 dark:border-ink-800 dark:bg-ink-800">
          <Image
            src={tool.logo}
            alt={`${tool.name} logo`}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${PRICING_STYLE[tool.pricing]}`}
        >
          {PRICING_LABEL[tool.pricing]}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-display text-lg font-semibold">{tool.name}</h3>
        <p className="text-xs text-ink-500 dark:text-ink-400">
          {tool.tagline}
        </p>
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-600 dark:text-ink-300">
        {tool.description}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-ink-200/70 pt-4 dark:border-ink-800/70">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{tool.rating.toFixed(1)}</span>
          <span className="text-xs text-ink-500 dark:text-ink-400"> / 5</span>
        </div>
        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
        >
          開啟官網
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

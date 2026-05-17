"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";

interface LinkPreviewProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
}

export function LinkPreview({ url, title, description, image }: LinkPreviewProps) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl border border-ink-200 p-3 transition hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/50"
    >
      {image && (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
          <Image src={image} alt={title ?? "Link preview"} fill sizes="96px" className="object-cover" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-xs text-ink-400">
          <ExternalLink className="h-3 w-3" />
          <span className="truncate">{url}</span>
        </div>
        {title && <p className="mt-1 line-clamp-1 text-sm font-semibold">{title}</p>}
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{description}</p>
        )}
      </div>
    </a>
  );
}
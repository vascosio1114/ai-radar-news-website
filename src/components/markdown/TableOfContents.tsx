"use client";

import { useState, useEffect } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
}

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * Parses markdown content and extracts headings as TocItem[].
 */
export function parseMarkdownHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    items.push({ id, text, level });
  }

  return items;
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="relative">
      {/* Mobile dropdown toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 flex w-full items-center justify-between rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium dark:border-ink-700 dark:bg-ink-800 lg:hidden"
      >
        <span>目錄</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* TOC content */}
      <div
        className={`${isOpen ? "block" : "hidden"} rounded-lg border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-800 lg:block lg:bg-transparent lg:border-none lg:p-0`}
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
          目錄
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? "ml-4" : ""}
            >
              <a
                href={`#${item.id}`}
                className={`block text-sm transition-colors ${
                  activeId === item.id
                    ? "font-medium text-accent-600 dark:text-accent-400"
                    : "text-ink-600 hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
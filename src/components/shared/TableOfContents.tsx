"use client";

import { useState, useEffect } from "react";
import { List } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
}

interface TableOfContentsProps {
  content: string;
  lang?: Lang;
}

/**
 * Parses markdown content and extracts headings as TocItem[].
 */
function parseMarkdownHeadings(content: string): TocItem[] {
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

export default function TableOfContents({ content, lang = "zh" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const items = parseMarkdownHeadings(content);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="lg:sticky top-24">
      {/* Mobile dropdown toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-3 flex w-full items-center gap-2 rounded-xl border border-ink-200/60 bg-white/70 px-4 py-2.5 text-sm font-medium backdrop-blur-md transition hover:bg-white/90 dark:border-ink-700/60 dark:bg-ink-900/70 dark:hover:bg-ink-900/90 lg:hidden"
      >
        <List className="h-4 w-4 text-accent-600 dark:text-accent-400" />
        <span>{lang === "zh" ? "目錄" : "Contents"}</span>
        <svg
          className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* TOC content */}
      <div
        className={`${isOpen ? "block" : "hidden"} rounded-xl border border-ink-200/60 bg-white/70 p-4 backdrop-blur-md dark:border-ink-700/60 dark:bg-ink-900/70 lg:block lg:border-none lg:bg-transparent lg:p-0`}
      >
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
          <List className="h-3.5 w-3.5" />
          {lang === "zh" ? "目錄" : "Contents"}
        </h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className={item.level === 3 ? "ml-3" : ""}>
              <a
                href={`#${item.id}`}
                className={`block text-sm transition-all duration-200 ${
                  activeId === item.id
                    ? "font-medium text-accent-600 dark:text-accent-400 translate-x-0.5"
                    : "text-ink-500 hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                }}
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
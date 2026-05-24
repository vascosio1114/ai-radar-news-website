"use client";

import { useState, useMemo } from "react";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Search, X } from "lucide-react";
import type { Article } from "@/types";
import type { Lang } from "@/lib/i18n";

type Props = {
  articles: Article[];
  lang: Lang;
  categories: string[];
  s: { newsPageTitle: string; newsPageDesc: string };
};

export function NewsFeed({ articles, lang, categories, s }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        search === "" ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.excerpt ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "" || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [articles, search, selectedCategory]);

  const clearFilters = () => { setSearch(""); setSelectedCategory(""); };

  return (
    <div className="container-page section-pad">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          AI Blog
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {s.newsPageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
          {s.newsPageDesc}
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder={lang === "zh" ? "搜尋文章..." : "Search articles..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white pl-9 pr-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{lang === "zh" ? "全部分類" : "All Categories"}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {(search || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <X className="h-4 w-4" />
            {lang === "zh" ? "清除" : "Clear"}
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-ink-500">
            {lang === "zh" ? `找到 ${filtered.length} 篇文章` : `Found ${filtered.length} articles`}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-ink-200/70 bg-white p-8 text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-400">
          {lang === "zh" ? "沒有符合條件的文章。" : "No matching articles found."}
        </div>
      )}
    </div>
  );
}
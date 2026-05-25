"use client";

import { useState, useMemo, useCallback } from "react";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Article } from "@/types";
import type { Lang } from "@/lib/i18n";

type Props = {
  articles: Article[];
  lang: Lang;
  categories: string[];
  s: { newsPageTitle: string; newsPageDesc: string };
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
};

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const terms = query.replace(/[^\w\s]/g, "\\$&").split(/\s+/).filter(Boolean);
  if (terms.length === 0) return <>{text}</>;
  const regex = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5">{part}</mark> : part
      )}
    </>
  );
}

function SearchResultCard({ article, lang, query }: { article: Article; lang: Lang; query: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
        {article.category}
      </div>
      <h3 className="mb-2 text-lg font-semibold leading-snug">
        <HighlightedText text={article.title} query={query} />
      </h3>
      <p className="mb-4 text-sm text-ink-500 line-clamp-2">
        <HighlightedText text={article.excerpt ?? ""} query={query} />
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-400">{article.author}</span>
        <a
          href={`/blog/${article.slug}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {lang === "zh" ? "閱讀全文" : "Read more"} →
        </a>
      </div>
    </div>
  );
}

export function NewsFeed({ articles, lang, categories, s, page, totalPages, total, start, end }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchResults, setSearchResults] = useState<Article[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
      const data = await res.json();
      setSearchResults(data.articles || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [lang]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    performSearch(val);
  };

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = selectedCategory === "" || a.category === selectedCategory;
      return matchCat;
    });
  }, [articles, selectedCategory]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSearchResults(null);
  };

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
            onChange={handleSearchChange}
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

      {searchLoading ? (
        <div className="rounded-3xl border border-ink-200/70 bg-white p-8 text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-400">
          {lang === "zh" ? "搜尋中..." : "Searching..."}
        </div>
      ) : searchResults !== null ? (
        searchResults.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-ink-500">
              {lang === "zh" ? `找到 ${searchResults.length} 篇相關文章` : `Found ${searchResults.length} articles`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((a) => (
                <SearchResultCard key={a.id} article={a} lang={lang} query={search} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-ink-200/70 bg-white p-8 text-sm text-ink-500 dark:border-ink-800/70 dark:bg-ink-900 dark:text-ink-400">
            {lang === "zh" ? "沒有符合條件的文章。" : "No matching articles found."}
          </div>
        )
      ) : filtered.length > 0 ? (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-ink-500">
            {lang === "zh"
              ? `顯示第 ${start}-${end} 條，共 ${total} 條`
              : `Showing ${start}-${end} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`?page=${page - 1}${search ? `&q=${search}` : ""}${selectedCategory ? `&category=${selectedCategory}` : ""}`}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                page <= 1
                  ? "pointer-events-none text-ink-300 dark:text-ink-600"
                  : "text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              }`}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {lang === "zh" ? "上一頁" : "Previous"}
            </a>
            <a
              href={`?page=${page + 1}${search ? `&q=${search}` : ""}${selectedCategory ? `&category=${selectedCategory}` : ""}`}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                page >= totalPages
                  ? "pointer-events-none text-ink-300 dark:text-ink-600"
                  : "text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              }`}
              aria-disabled={page >= totalPages}
            >
              {lang === "zh" ? "下一頁" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
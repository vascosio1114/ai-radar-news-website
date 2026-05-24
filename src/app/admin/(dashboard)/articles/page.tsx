"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, Search, X } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  author: string;
  published_at: string;
  reading_time: number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  content?: string | null;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setArticles(d.articles ?? []); }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這篇文章嗎？")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleTogglePublish = async (article: Article) => {
    await fetch(`/api/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !article.is_published }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === article.id ? { ...a, is_published: !a.is_published } : a
      )
    );
  };

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort();

  const filteredArticles = articles.filter((article) => {
    const matchSearch = search === "" ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.slug.toLowerCase().includes(search.toLowerCase()) ||
      article.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "" || article.category === filterCategory;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "published" && article.is_published) ||
      (filterStatus === "draft" && !article.is_published);
    return matchSearch && matchCategory && matchStatus;
  });

  const clearFilters = () => { setSearch(""); setFilterCategory(""); setFilterStatus("all"); };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded bg-ink-200 dark:bg-ink-700 animate-pulse" />
        <div className="h-64 rounded bg-ink-200 dark:bg-ink-700 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-500">
        載入失敗：{error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          新增文章
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="搜尋標題、slug 或分類..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white pl-9 pr-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部分類</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "published" | "draft")}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">全部狀態</option>
          <option value="published">已發佈</option>
          <option value="draft">草稿</option>
        </select>
        {(search || filterCategory || filterStatus !== "all") && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <X className="h-4 w-4" />
            清除
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">尚未有任何文章</p>
          <Link href="/admin/articles/new" className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700">
            建立第一篇文章
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-800 overflow-hidden">
          <div className="px-4 py-2 text-sm text-ink-500 border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900">
            找到 {filteredArticles.length} 篇文章
          </div>
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-ink-500">
              {search || filterCategory || filterStatus !== "all" ? "沒有符合條件的文章" : "尚未有任何文章"}
            </div>
          ) : (
          <table className="w-full">
            <thead className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">標題</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">分類</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">狀態</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">瀏覽</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink-900 dark:text-ink-50">{article.title}</div>
                    <div className="text-xs text-ink-500">{article.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">{article.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.is_published
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                    }`}>
                      {article.is_published ? "已發佈" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">{article.views?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(article)}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title={article.is_published ? "取消發佈" : "發佈"}
                      >
                        {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/zh/news/${article.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="查看"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="編輯"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        title="刪除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
    </div>
  );
}
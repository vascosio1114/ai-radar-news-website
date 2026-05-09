"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, ExternalLink, TrendingUp } from "lucide-react";
import type { Tool } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  video: "AI Video",
  image: "AI Image",
  coding: "AI Coding",
  writing: "AI Writing",
  productivity: "AI Productivity",
};

const PRICING_LABELS: Record<string, string> = {
  free: "免費",
  freemium: "Freemium",
  paid: "付費",
};

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTools = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTools(data as Tool[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個工具嗎？")) return;

    setDeletingId(id);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("tools").delete().eq("id", id);

    if (!error) {
      setTools((prev) => prev.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-ink-200 dark:bg-ink-700" />
        <div className="h-64 rounded bg-ink-200 dark:bg-ink-700" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">工具管理</h1>
        <Link
          href="/admin/tools/new"
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          新增工具
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">尚未有任何工具</p>
          <Link
            href="/admin/tools/new"
            className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
          >
            建立第一個工具
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full">
            <thead className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  名稱
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  分類
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  定價
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  評分
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  狀態
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {tools.map((tool) => (
                <tr
                  key={tool.id}
                  className="hover:bg-ink-50 dark:hover:bg-ink-900/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {tool.logo && (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="h-8 w-8 rounded-lg object-contain"
                        />
                      )}
                      <div>
                        <div className="font-medium text-ink-900 dark:text-ink-50">
                          {tool.name}
                        </div>
                        <div className="text-xs text-ink-500">{tool.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    {CATEGORY_LABELS[tool.category] || tool.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tool.pricing === "free"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : tool.pricing === "paid"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {PRICING_LABELS[tool.pricing]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      {tool.rating?.toFixed(1) || "0.0"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {tool.is_trending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        <TrendingUp className="h-3 w-3" />
                        熱門
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={tool.website}
                        target="_blank"
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="訪問官網"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="編輯"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        disabled={deletingId === tool.id}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
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
        </div>
      )}
    </div>
  );
}
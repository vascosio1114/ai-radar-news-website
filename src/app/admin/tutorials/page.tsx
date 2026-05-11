"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { Tutorial } from "@/types";

const LEVEL_LABELS: Record<string, string> = {
  新手: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  中級: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  進階: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTutorials = async () => {
    const res = await fetch("/api/admin/tutorials");
    if (res.ok) {
      const { tutorials } = await res.json();
      setTutorials(tutorials as Tutorial[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個教學嗎？")) return;

    setDeletingId(id);
    const res = await fetch(`/api/admin/tutorials/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTutorials((prev) => prev.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  const handleTogglePublish = async (tutorial: Tutorial) => {
    const res = await fetch(`/api/admin/tutorials/${tutorial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !tutorial.is_published }),
    });
    if (res.ok) {
      setTutorials((prev) =>
        prev.map((t) =>
          t.id === tutorial.id
            ? { ...t, is_published: !tutorial.is_published }
            : t
        )
      );
    }
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
        <h1 className="font-display text-2xl font-bold tracking-tight">教學管理</h1>
        <Link
          href="/admin/tutorials/new"
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          新增教學
        </Link>
      </div>

      {tutorials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 p-12 text-center dark:border-ink-700">
          <p className="text-ink-500 dark:text-ink-400">尚未有任何教學</p>
          <Link
            href="/admin/tutorials/new"
            className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
          >
            建立第一個教學
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-800">
          <table className="w-full">
            <thead className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  標題
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  難度
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-500">
                  時長
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
              {tutorials.map((tutorial) => (
                <tr
                  key={tutorial.id}
                  className="hover:bg-ink-50 dark:hover:bg-ink-900/50"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-ink-900 dark:text-ink-50">
                        {tutorial.title}
                      </div>
                      <div className="text-xs text-ink-500">{tutorial.slug}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        LEVEL_LABELS[tutorial.level] ||
                        "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                      }`}
                    >
                      {tutorial.level || "新手"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 dark:text-ink-400">
                    {tutorial.duration || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tutorial.is_published
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                      }`}
                    >
                      {tutorial.is_published ? "已發佈" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(tutorial)}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title={tutorial.is_published ? "取消發佈" : "發佈"}
                      >
                        {tutorial.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/tutorials/${tutorial.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="查看"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/tutorials/${tutorial.id}/edit`}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-300"
                        title="編輯"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(tutorial.id)}
                        disabled={deletingId === tutorial.id}
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
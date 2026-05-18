"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Home, PenLine, Plus } from "lucide-react";
import ArticleForm from "@/components/admin/ArticleForm";
import type { ArticleFormData } from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdArticle, setCreatedArticle] = useState<{ slug: string; is_published: boolean } | null>(null);

  const handleSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        alert("儲存失敗：" + (result.error || "Unknown error"));
        return;
      }

      setCreatedArticle({
        slug: result.article.slug,
        is_published: result.article.is_published,
      });
      router.refresh();
    } catch {
      alert("儲存失敗：Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdArticle) {
    return (
      <div className="rounded-3xl border border-ink-200 bg-white p-8 shadow-soft dark:border-ink-800 dark:bg-ink-950/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400">
          <PenLine className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-white">
          Blog 文章已儲存
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
          {createdArticle.is_published
            ? "文章已發佈，會自動出現喺首頁最新文章同 Blog 列表。"
            : "文章已儲存為草稿，發佈後就會出現喺首頁最新文章同 Blog 列表。"}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {createdArticle.is_published && (
            <Link
              href={`/zh/news/${createdArticle.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              查看文章
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/zh"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            去主頁睇
            <Home className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/articles/new"
            onClick={() => setCreatedArticle(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:bg-ink-800"
          >
            再寫一篇
            <Plus className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900 dark:hover:text-white"
          >
            返回文章管理
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/articles"
        className="mb-5 inline-flex items-center gap-2 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
      >
        <ArrowLeft className="h-4 w-4" />
        返回文章管理
      </Link>

      <div className="mb-6 rounded-3xl border border-ink-200 bg-white/80 p-6 shadow-soft dark:border-ink-800 dark:bg-ink-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-600 dark:text-accent-400">
          Blog Composer
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-white">
          寫新 Blog 文章
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
          用 Markdown 寫文章。勾選「已發佈」後，文章會直接連到主頁「最新 AI 文章」同 Blog 列表。
        </p>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <ArticleForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
          initialData={{
            category: "AI 文章",
            author: "RADAR AI Studio",
            published_at: new Date().toISOString().split("T")[0],
            is_published: true,
          } as Partial<ArticleFormData>}
        />
      </div>
    </div>
  );
}

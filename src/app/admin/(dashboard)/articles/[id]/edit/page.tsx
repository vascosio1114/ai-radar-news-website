"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import type { ArticleFormData } from "@/components/admin/ArticleForm";
import type { Article } from "@/types";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      const res = await fetch(`/api/admin/articles/${params.id}`);
      const result = await res.json().catch(() => ({}));

      if (res.ok && result.article) {
        setArticle(result.article as Article);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  const handleSubmit = async (data: ArticleFormData) => {
    const res = await fetch(`/api/admin/articles/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      alert("更新失敗：" + (result.error || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 rounded bg-ink-200 dark:bg-ink-700" />
        <div className="h-96 rounded bg-ink-200 dark:bg-ink-700" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="rounded-2xl border border-ink-200 p-12 text-center dark:border-ink-800">
        <p className="text-ink-500">文章不存在</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        編輯文章
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <ArticleForm
          initialData={{
            title: article.title,
            title_zh: article.title_zh || "",
            slug: article.slug,
            excerpt: article.excerpt || "",
            excerpt_zh: article.excerpt_zh || "",
            cover_image: article.cover_image || "",
            category: article.category,
            tags: article.tags || [],
            content: article.content || "",
            content_zh: article.content_zh || "",
            summary_content: article.summary_content || "",
            email_content: article.email_content || "",
            published_at: article.published_at
              ? article.published_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            is_featured: article.is_featured,
            is_published: article.is_published,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
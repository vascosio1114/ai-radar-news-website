"use client";

import { useRouter } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import type { ArticleFormData } from "@/components/admin/ArticleForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: ArticleFormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("articles").insert({
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: data.excerpt,
      cover_image: data.cover_image || null,
      content: data.content || null,
      category: data.category,
      tags: data.tags,
      is_featured: data.is_featured,
      is_published: data.is_published,
    });

    if (!error) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      alert("儲存失敗：" + error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        新增文章
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <ArticleForm onSubmit={handleSubmit} onCancel={() => router.back()} />
      </div>
    </div>
  );
}
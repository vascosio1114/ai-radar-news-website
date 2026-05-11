"use client";

import { useRouter } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import type { ArticleFormData } from "@/components/admin/ArticleForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewArticlePage() {
  const router = useRouter();

  const handleSubmit = async (data: ArticleFormData) => {
    const supabase = createSupabaseBrowserClient();
    const dateStr = data.published_at || new Date().toISOString().split("T")[0];
    const slug =
      data.slug ||
      `${dateStr}-${data.title.toLowerCase().replace(/[^\w\s一-鿿]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()}`;
    const { error } = await supabase.from("articles").insert({
      title: data.title,
      slug,
      excerpt: data.excerpt,
      excerpt_zh: data.excerpt_zh || null,
      cover_image: data.cover_image || null,
      content: data.content || null,
      content_zh: data.content_zh || null,
      category: data.category,
      tags: data.tags,
      published_at: data.published_at ? new Date(data.published_at).toISOString() : null,
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
        <ArticleForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          initialData={{
            published_at: new Date().toISOString().split("T")[0],
          }}
        />
      </div>
    </div>
  );
}
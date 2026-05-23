"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TutorialForm from "@/components/admin/TutorialForm";
import type { TutorialFormData } from "@/components/admin/TutorialForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tutorial } from "@/types";

export default function EditTutorialPage() {
  const params = useParams();
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorial = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setTutorial(data as Tutorial);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchTutorial();
    }
  }, [params.id]);

  const handleSubmit = async (data: TutorialFormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("tutorials")
      .update({
        title: data.title,
        slug: data.slug,
        level: data.level,
        duration: data.duration,
        cover_image: data.cover_image || null,
        excerpt: data.excerpt,
        content: data.content || null,
        is_published: data.is_published,
      })
      .eq("id", params.id);

    if (!error) {
      router.push("/admin/tutorials");
      router.refresh();
    } else {
      alert("更新失敗：" + error.message);
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

  if (!tutorial) {
    return (
      <div className="rounded-2xl border border-ink-200 p-12 text-center dark:border-ink-800">
        <p className="text-ink-500">教學不存在</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        編輯教學
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <TutorialForm
          initialData={{
            title: tutorial.title,
            slug: tutorial.slug,
            level: tutorial.level as "新手" | "中級" | "進階",
            duration: tutorial.duration || "",
            cover_image: tutorial.cover_image || "",
            excerpt: tutorial.excerpt || "",
            content: tutorial.content || "",
            is_published: tutorial.is_published,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
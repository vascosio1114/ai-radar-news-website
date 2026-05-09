"use client";

import { useRouter } from "next/navigation";
import TutorialForm from "@/components/admin/TutorialForm";
import type { TutorialFormData } from "@/components/admin/TutorialForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewTutorialPage() {
  const router = useRouter();

  const handleSubmit = async (data: TutorialFormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("tutorials").insert({
      title: data.title,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
      level: data.level,
      duration: data.duration,
      cover_image: data.cover_image || null,
      excerpt: data.excerpt,
      content: data.content || null,
      is_published: data.is_published,
    });

    if (!error) {
      router.push("/admin/tutorials");
      router.refresh();
    } else {
      alert("儲存失敗：" + error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        新增教學
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <TutorialForm onSubmit={handleSubmit} onCancel={() => router.back()} />
      </div>
    </div>
  );
}
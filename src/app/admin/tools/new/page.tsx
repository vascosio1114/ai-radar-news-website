"use client";

import { useRouter } from "next/navigation";
import ToolForm from "@/components/admin/ToolForm";
import type { ToolFormData } from "@/components/admin/ToolForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NewToolPage() {
  const router = useRouter();

  const handleSubmit = async (data: ToolFormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("tools").insert({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      tagline: data.tagline,
      description: data.description,
      logo: data.logo || null,
      website: data.website,
      category: data.category,
      rating: data.rating,
      pricing: data.pricing,
      is_trending: data.is_trending,
    });

    if (!error) {
      router.push("/admin/tools");
      router.refresh();
    } else {
      alert("儲存失敗：" + error.message);
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        新增工具
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <ToolForm onSubmit={handleSubmit} onCancel={() => router.back()} />
      </div>
    </div>
  );
}
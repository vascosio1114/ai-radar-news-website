"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ToolForm from "@/components/admin/ToolForm";
import type { ToolFormData } from "@/components/admin/ToolForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tool } from "@/types";

export default function EditToolPage() {
  const params = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTool = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error && data) {
        setTool(data as Tool);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchTool();
    }
  }, [params.id]);

  const handleSubmit = async (data: ToolFormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("tools")
      .update({
        name: data.name,
        slug: data.slug,
        tagline: data.tagline,
        description: data.description,
        logo: data.logo || null,
        website: data.website,
        category: data.category,
        rating: data.rating,
        pricing: data.pricing,
        is_trending: data.is_trending,
      })
      .eq("id", params.id);

    if (!error) {
      router.push("/admin/tools");
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

  if (!tool) {
    return (
      <div className="rounded-2xl border border-ink-200 p-12 text-center dark:border-ink-800">
        <p className="text-ink-500">工具不存在</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight">
        編輯工具
      </h1>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
        <ToolForm
          initialData={{
            name: tool.name,
            slug: tool.slug,
            tagline: tool.tagline || "",
            description: tool.description || "",
            logo: tool.logo || "",
            website: tool.website,
            category: tool.category as string,
            rating: tool.rating || 0,
            pricing: tool.pricing,
            is_trending: tool.is_trending,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
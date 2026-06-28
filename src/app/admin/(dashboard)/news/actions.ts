"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { parseTags } from "@/lib/admin-news";
import { runDraftGeneration } from "@/lib/pipeline/draft";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function requireAdminAction() {
  const admin = await getCurrentAdmin();
  if (!admin.user || !admin.isAdmin) {
    throw new Error("Admin access required");
  }
}

function redirectToNews(params = "") {
  const suffix = params ? `?${params}` : "";
  redirect(`/admin/news${suffix}`);
}

export async function publishArticle(formData: FormData) {
  await requireAdminAction();

  const id = String(formData.get("id") || "");
  const { error } = await createSupabaseAdminClient()
    .from("articles")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      review_status: "approved",
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirectToNews();
}

export async function deleteArticle(formData: FormData) {
  await requireAdminAction();

  const id = String(formData.get("id") || "");
  const { error } = await createSupabaseAdminClient()
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirectToNews();
}

export async function saveArticle(formData: FormData) {
  await requireAdminAction();

  const id = String(formData.get("id") || "");
  const titleZh = String(formData.get("title_zh") || "").trim();
  const titleEn = String(formData.get("title_en") || "").trim();
  const excerptZh = String(formData.get("excerpt_zh") || "").trim();
  const excerptEn = String(formData.get("excerpt_en") || "").trim();
  const contentZh = String(formData.get("content_zh") || "").trim();
  const contentEn = String(formData.get("content_en") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const tags = parseTags(formData.get("tags"));
  const approved = formData.get("review_status") === "approved";

  const { error } = await createSupabaseAdminClient()
    .from("articles")
    .update({
      title: titleZh || titleEn,
      title_zh: titleZh || null,
      title_en: titleEn || null,
      excerpt: excerptZh || excerptEn,
      excerpt_zh: excerptZh || null,
      excerpt_en: excerptEn || null,
      content: contentZh || contentEn,
      content_zh: contentZh || null,
      content_en: contentEn || null,
      summary_content: excerptZh || excerptEn || null,
      summary_content_zh: excerptZh || null,
      category,
      tags,
      review_status: approved ? "approved" : "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirectToNews();
}

export async function publishAllApproved() {
  await requireAdminAction();

  const { error } = await createSupabaseAdminClient()
    .from("articles")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("is_published", false)
    .eq("review_status", "approved");

  if (error) throw error;
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirectToNews();
}

export async function regenerateFailedDrafts() {
  await requireAdminAction();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("raw_items")
    .update({
      status: "new",
      processed_at: null,
    })
    .eq("status", "failed");

  if (error) throw error;

  await runDraftGeneration();
  revalidatePath("/admin");
  revalidatePath("/admin/news");
  redirectToNews();
}

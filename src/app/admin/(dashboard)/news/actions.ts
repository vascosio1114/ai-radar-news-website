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
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const tags = parseTags(formData.get("tags"));
  const approved = formData.get("review_status") === "approved";

  const { error } = await createSupabaseAdminClient()
    .from("articles")
    .update({
      title,
      title_zh: title,
      excerpt,
      excerpt_zh: excerpt,
      content,
      content_zh: content,
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

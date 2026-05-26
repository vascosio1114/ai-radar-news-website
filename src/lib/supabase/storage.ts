import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BucketType = "article-covers" | "tutorial-covers";

/**
 * Uploads a cover image to Supabase storage and returns the public URL.
 */
export async function uploadCoverImage(
  file: File,
  bucket: BucketType
): Promise<string> {
  const supabase = createSupabaseBrowserClient();

  const timestamp = Date.now();
  const ext = file.name.split(".").pop() ?? "";
  const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${bucket}/${filename}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload cover image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
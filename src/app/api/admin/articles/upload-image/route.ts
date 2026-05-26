import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "article-image-upload" });

const BUCKET = "articles";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

async function ensureBucket(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.id === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_SIZE,
    });
    if (error && error.message !== "Bucket already exists") {
      log.error({ err: error }, "Failed to create articles bucket");
    }
  }
}

export async function POST(request: Request) {
  try {
    const serverClient = createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Image file required" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_EXTS.join(", ")}` }, { status: 400 });
    }

    await ensureBucket(admin);

    const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await admin.storage
      .from(BUCKET)
      .upload(filename, file, { upsert: false });

    if (error) {
      log.error({ err: error }, "Failed to upload article image");
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch (e) {
    log.error({ err: e }, "Unexpected error uploading article image");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const communityLogger = logger.child({ component: "community-upload" });

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    if (!["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("thread-images")
      .upload(fileName, file, { upsert: false });

    if (error) {
      communityLogger.error({ err: error }, "Failed to upload image");
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("thread-images").getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (e) {
    communityLogger.error({ err: e }, "Unexpected error uploading image");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
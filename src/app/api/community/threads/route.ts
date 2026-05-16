import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { data, error } = await supabase
      .from("threads")
      .select("*, profile:profiles(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching threads:", error);
      return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
    }

    return NextResponse.json({ threads: data ?? [] });
  } catch (error) {
    console.error("Error in GET /api/community/threads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, image_url, link_url, link_title, link_description, link_image } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Content must be 2000 characters or less" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("threads")
      .insert({
        author_id: user.id,
        content: content.trim(),
        image_url: image_url || null,
        link_url: link_url || null,
        link_title: link_title || null,
        link_description: link_description || null,
        link_image: link_image || null,
      })
      .select("*, profile:profiles(display_name, avatar_url)")
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
    }

    return NextResponse.json({ thread: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/community/threads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // 如果未連 Supabase（env 缺失），靜靜咁回成功，方便 dev
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ok: true, mocked: true });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });

    if (error && error.code !== "23505" /* unique_violation */) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

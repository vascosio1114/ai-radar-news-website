import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const newsletterLogger = logger.child({ component: "newsletter" });

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 1 ? local[0] + "***" : "***";
  return `${maskedLocal}@${domain}`;
}

export async function POST(request: Request) {
  let email = "";
  try {
    ({ email } = await request.json());

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
    newsletterLogger.error({ email: maskEmail(email), err: e }, "Newsletter subscription failed");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

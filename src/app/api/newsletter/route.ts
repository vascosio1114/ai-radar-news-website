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
  let dailyOptIn = false;
  try {
    const body = await request.json();
    email = body.email || "";
    dailyOptIn = body.daily_opt_in === true;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ok: true, mocked: true });
    }

    const supabase = createSupabaseServerClient();

    // Always insert into newsletter_subscribers (legacy)
    try {
      await supabase.from("newsletter_subscribers").insert({ email });
    } catch {
      // ignore duplicates
    }

    // If daily_opt_in, insert/update mail_subscribers
    if (dailyOptIn) {
      await supabase
        .from("mail_subscribers")
        .upsert(
          { email, opted_in: true, is_confirmed: true },
          { onConflict: "email" }
        );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    newsletterLogger.error({ email: maskEmail(email), err: e }, "Newsletter subscription failed");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

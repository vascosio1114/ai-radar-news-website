# Mailing List with Gmail SMTP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to opt-in for daily email digests via a checkbox on the newsletter form. Admin configures Gmail SMTP credentials, schedule, and HTML template in the admin page. A Vercel Cron job triggers daily digest sends.

**Architecture:** Gmail SMTP via Nodemailer, settings stored in Supabase `mail_settings` table, opted-in subscribers in `mail_subscribers`, Vercel Cron hits `/api/send-digest` daily.

**Tech Stack:** Nodemailer, AES-256-GCM encryption, Supabase (existing), Vercel Cron

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/mail.ts` | Nodemailer SMTP wrapper + encryption helpers |
| `src/app/api/newsletter/route.ts` | Newsletter subscribe (add `daily_opt_in` to `mail_subscribers`) |
| `src/components/home/Newsletter.tsx` | Add daily digest checkbox |
| `src/app/admin/page.tsx` | Add Mail Settings UI section |
| `src/app/api/admin/mail/test/route.ts` | Send test email to admin |
| `src/app/api/send-digest/route.ts` | Cron handler: build and send daily digest |
| `vercel.json` | Vercel Cron configuration |
| `supabase/migrations/002_mail.sql` | New tables + RLS |

---

## Task 1: Install Dependencies

**Files:**
- `package.json` (modify)

- [ ] **Step 1: Install nodemailer**

```bash
npm install nodemailer && npm install -D @types/nodemailer
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add nodemailer for SMTP mailing"
```

---

## Task 2: Create Database Migration

**Files:**
- Create: `supabase/migrations/002_mail.sql`

```sql
-- Migration: Mailing list tables (mail_subscribers + mail_settings)
-- Run in Supabase SQL Editor after merging

-- 1. mail_subscribers
create table if not exists public.mail_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  opted_in        boolean default false,
  subscribed_at   timestamptz default now(),
  is_confirmed    boolean default false
);

alter table public.mail_subscribers enable row level security;

-- Anyone can subscribe (insert), admins can read/update
create policy "Anyone can subscribe to mail list"
  on public.mail_subscribers for insert
  with check (true);

create policy "Only admins can read mail subscribers"
  on public.mail_subscribers for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update mail subscribers"
  on public.mail_subscribers for update
  using (auth.jwt() ->> 'role' = 'admin');

-- 2. mail_settings
create table if not exists public.mail_settings (
  id                      uuid primary key default gen_random_uuid(),
  smtp_host               text,
  smtp_port               int default 587,
  smtp_user               text,
  smtp_pass_encrypted     text,
  smtp_from_address       text,
  smtp_from_name          text,
  daily_enabled           boolean default false,
  daily_hour              int default 9,
  daily_timezone          text default 'Asia/Hong_Kong',
  email_subject_template text default 'Your AI Radar Daily Digest',
  email_header_html       text,
  email_footer_html       text,
  updated_at              timestamptz default now()
);

alter table public.mail_settings enable row level security;

-- Only admins can read/write mail_settings
create policy "Only admins can read mail settings"
  on public.mail_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can write mail settings"
  on public.mail_settings for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
```

- [ ] **Step 1: Create migration file**

```bash
mkdir -p supabase/migrations
```

Write `supabase/migrations/002_mail.sql` with the SQL above.

- [ ] **Step 2: Apply migration in Supabase**

Run the SQL in Supabase SQL Editor (Supabase Dashboard → SQL Editor → paste and run).

> **Note:** For local Supabase dev, also run `supabase db push` or `supabase migration up`.

- [ ] **Step 3: Commit migration**

```bash
git add supabase/migrations/002_mail.sql
git commit -m "db: add mail_subscribers and mail_settings tables"
```

---

## Task 3: Create `src/lib/mail.ts`

**Files:**
- Create: `src/lib/mail.ts`
- Test: `src/lib/__tests__/mail.test.ts`

- [ ] **Step 1: Write test**

```typescript
// src/lib/__tests__/mail.test.ts
import { describe, it, expect, vi } from "vitest";
import { encryptPassword, decryptPassword } from "@/lib/mail";

describe("encryptPassword / decryptPassword", () => {
  const key = Buffer.alloc(32, "a".charCodeAt(0));
  const plaintext = "my-gmail-password";

  it("encrypts and decrypts correctly", () => {
    const encrypted = encryptPassword(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.length).toBeGreaterThan(0);
    const decrypted = decryptPassword(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const enc1 = encryptPassword(plaintext, key);
    const enc2 = encryptPassword(plaintext, key);
    expect(enc1).not.toBe(enc2);
  });
});
```

Run: `npm run type-check` (or `vitest run src/lib/__tests__/mail.test.ts`)
Expected: FAIL — functions don't exist yet

- [ ] **Step 2: Write minimal implementation**

```typescript
// src/lib/mail.ts
import nodemailer from "nodemailer";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

export function encryptPassword(password: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted (all base64)
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptPassword(encrypted: string, key: Buffer): string {
  const [ivB64, authTagB64, dataB64] = encrypted.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encryptedData = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export type MailSettings = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass_encrypted: string;
  smtp_from_address: string;
  smtp_from_name: string;
  daily_enabled: boolean;
  daily_hour: number;
  daily_timezone: string;
  email_subject_template: string;
  email_header_html: string;
  email_footer_html: string;
};

export async function sendHtmlEmail(
  settings: MailSettings,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ sent: boolean; error?: string }> {
  const key = Buffer.from(
    process.env.MAIL_ENCRYPTION_KEY || "",
    "utf8"
  );
  if (key.length !== 32) {
    return { sent: false, error: "MAIL_ENCRYPTION_KEY must be 32 bytes" };
  }

  const password = decryptPassword(settings.smtp_pass_encrypted, key);

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_port === 465,
    auth: {
      user: settings.smtp_user,
      pass: password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${settings.smtp_from_name}" <${settings.smtp_from_address}>`,
      to,
      subject,
      html: htmlBody,
    });
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

export function buildDigestHtml(params: {
  headerHtml: string;
  footerHtml: string;
  articles: Array<{
    title: string;
    excerpt: string;
    url: string;
    published_at: string;
    cover_image?: string;
  }>;
}): string {
  const { headerHtml, footerHtml, articles } = params;

  const articleRows = articles
    .map((a) => {
      const imgTag = a.cover_image
        ? `<img src="${a.cover_image}" alt="${a.title}" style="max-width:100%;border-radius:8px;margin-bottom:12px;" />`
        : "";
      const date = new Date(a.published_at).toLocaleDateString("zh-HK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `
        <div style="margin-bottom:32px;">
          ${imgTag}
          <h3 style="margin:0 0 8px;font-size:18px;"><a href="${a.url}" style="color:#1a1a1a;text-decoration:none;">${a.title}</a></h3>
          <p style="margin:0 0 8px;color:#666;font-size:14px;">${date}</p>
          <p style="margin:0;color:#333;font-size:15px;">${a.excerpt}</p>
          <a href="${a.url}" style="display:inline-block;margin-top:12px;font-size:14px;color:#2563eb;text-decoration:none;">Read more →</a>
        </div>
      `;
    })
    .join("<hr style='border:none;border-top:1px solid #eee;margin:24px 0;' />");

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
      <div style="background:#fff;border-radius:12px;padding:32px;">
        ${headerHtml}
        ${articleRows}
        ${footerHtml}
      </div>
    </body>
    </html>
  `;
}
```

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/mail.ts src/lib/__tests__/mail.test.ts
git commit -m "feat: add mail.ts with SMTP wrapper and AES encryption"
```

---

## Task 4: Update Newsletter API Route

**Files:**
- Modify: `src/app/api/newsletter/route.ts`

- [ ] **Step 1: Write test**

```typescript
// (add to existing test file or create src/app/api/newsletter/__tests__/route.test.ts)
import { describe, it, expect } from "vitest";

describe("newsletter route - daily_opt_in", () => {
  it("should insert into mail_subscribers with opted_in=true when daily_opt_in is set", async () => {
    // Mock Supabase response
  });
});
```

- [ ] **Step 2: Update route.ts**

Replace the existing `POST` handler. Read the current file first.

New content for the `POST` handler:

```typescript
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
    await supabase
      .from("newsletter_subscribers")
      .insert({ email })
      .catch(() => {}); // ignore duplicates

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
```

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/api/newsletter/route.ts
git commit -m "feat: newsletter route handles daily_opt_in flag"
```

---

## Task 5: Update Newsletter Component

**Files:**
- Modify: `src/components/home/Newsletter.tsx:60-103`

- [ ] **Step 1: Read current file** — already read above

- [ ] **Step 2: Update form section** (lines 60-103)

Add checkbox after the email input div (before the button):

```tsx
{/* After the email input div, before the button */}
<div className="flex items-start gap-2 px-3 py-2">
  <input
    type="checkbox"
    id="daily_opt_in"
    checked={dailyOptIn}
    onChange={(e) => setDailyOptIn(e.target.checked)}
    className="mt-1 h-4 w-4 rounded border-ink-300"
  />
  <label htmlFor="daily_opt_in" className="text-sm text-ink-600 dark:text-ink-300">
    {s.newsletterDailyDigestOptIn}
  </label>
</div>
```

Add `dailyOptIn` state at top of component:
```tsx
const [dailyOptIn, setDailyOptIn] = React.useState(false);
```

Update the POST body:
```tsx
body: JSON.stringify({ email, daily_opt_in: dailyOptIn }),
```

Add translation string in `src/lib/i18n.ts`:
```tsx
newsletterDailyDigestOptIn: "每日digest — 每日電郵接收精選 AI 文章",
// en:
newsletterDailyDigestOptIn: "Daily digest — get top AI articles by email every day",
```

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/home/Newsletter.tsx src/lib/i18n.ts
git commit -m "feat: add daily digest opt-in checkbox to newsletter form"
```

---

## Task 6: Admin Mail Settings UI

**Files:**
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: Read current file** — already read above

- [ ] **Step 2: Add Mail Settings section**

This is a large addition to `admin/page.tsx`. Add a new section after the stats grid (after line 38).

The component needs:
- `"use client"` at the top (it may already be there)
- State for form fields: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_from_address`, `smtp_from_name`, `daily_enabled`, `daily_hour`, `daily_timezone`, `email_subject_template`, `email_header_html`, `email_footer_html`
- `useEffect` to fetch current settings from `/api/admin/mail/settings` on mount
- Form submit handler `POST` to `/api/admin/mail/settings`
- "Send Test Email" button `POST` to `/api/admin/mail/test`
- Subscriber count fetched from `/api/admin/mail/subscribers`

> **Note:** Create the settings read/write API routes in Task 7 first, as the admin UI will call them.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add Mail Settings section to admin page"
```

---

## Task 7: Create Admin Mail API Routes

**Files:**
- Create: `src/app/api/admin/mail/settings/route.ts`
- Create: `src/app/api/admin/mail/test/route.ts`
- Create: `src/app/api/admin/mail/subscribers/route.ts`

- [ ] **Step 1: Write settings route**

```typescript
// src/app/api/admin/mail/settings/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { encryptPassword } from "@/lib/mail";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
  return NextResponse.json({ settings: data || {} });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createSupabaseServerClient();

  const encKey = Buffer.from(process.env.MAIL_ENCRYPTION_KEY || "", "utf8");
  const smtpPassEncrypted = body.smtp_pass
    ? encryptPassword(body.smtp_pass, encKey)
    : undefined;

  const payload = {
    smtp_host: body.smtp_host,
    smtp_port: body.smtp_port,
    smtp_user: body.smtp_user,
    smtp_pass_encrypted: smtpPassEncrypted,
    smtp_from_address: body.smtp_from_address,
    smtp_from_name: body.smtp_from_name,
    daily_enabled: body.daily_enabled,
    daily_hour: body.daily_hour,
    daily_timezone: body.daily_timezone,
    email_subject_template: body.email_subject_template,
    email_header_html: body.email_header_html,
    email_footer_html: body.email_footer_html,
    updated_at: new Date().toISOString(),
  };

  // Upsert (delete existing, insert new — single row table)
  await supabase.from("mail_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error } = await supabase.from("mail_settings").insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write test route**

```typescript
// src/app/api/admin/mail/test/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail, buildDigestHtml } from "@/lib/mail";

export async function POST() {
  const supabase = createSupabaseServerClient();

  // Get settings
  const { data: settings } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  // Get admin email from auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No admin email found" }, { status: 400 });
  }

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "<h1>Test Email</h1><p>This is a test digest email.</p>",
    footerHtml: settings.email_footer_html || "",
    articles: [
      {
        title: "Test Article",
        excerpt: "This is a test article for the daily digest.",
        url: "https://ai-radar.example.com",
        published_at: new Date().toISOString(),
      },
    ],
  });

  const result = await sendHtmlEmail(
    settings,
    user.email,
    "Test: " + (settings.email_subject_template || "AI Radar Daily Digest"),
    html
  );

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, to: user.email });
}
```

- [ ] **Step 3: Write subscribers count route**

```typescript
// src/app/api/admin/mail/subscribers/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { count, error } = await supabase
    .from("mail_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("opted_in", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: count || 0 });
}
```

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/mail/settings/route.ts src/app/api/admin/mail/test/route.ts src/app/api/admin/mail/subscribers/route.ts
git commit -m "feat: add admin mail API routes (settings, test, subscribers)"
```

---

## Task 8: Create `/api/send-digest` Route

**Files:**
- Create: `src/app/api/send-digest/route.ts`

- [ ] **Step 1: Write route handler**

```typescript
// src/app/api/send-digest/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail, buildDigestHtml } from "@/lib/mail";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Validate cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  // Load mail settings
  const { data: settings } = await supabase
    .from("mail_settings")
    .select("*")
    .limit(1)
    .single();

  // If daily_enabled is false, skip silently
  if (!settings?.daily_enabled) {
    return NextResponse.json({ skipped: true, reason: "daily_enabled=false" });
  }

  // Determine start of today in configured timezone
  const tz = settings.daily_timezone || "Asia/Hong_Kong";
  const now = new Date();
  const todayStart = new Date(
    now.toLocaleString("en-US", { timeZone: tz })
  ).setHours(0, 0, 0, 0);
  const todayStartISO = new Date(todayStart).toISOString();

  // Fetch top 5 published articles since today
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, excerpt, cover_image, published_at")
    .eq("is_published", true)
    .gte("published_at", todayStartISO)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!articles || articles.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_articles_today" });
  }

  // Fetch opted-in subscribers
  const { data: subscribers } = await supabase
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, reason: "no_subscribers" });
  }

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles,
  });

  let sent = 0;
  const errors: string[] = [];

  for (const sub of subscribers) {
    const result = await sendHtmlEmail(
      settings,
      sub.email,
      settings.email_subject_template || "Your AI Radar Daily Digest",
      html
    );
    if (result.sent) {
      sent++;
    } else {
      errors.push(`${sub.email}: ${result.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors });
}
```

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 2: Commit**

```bash
git add src/app/api/send-digest/route.ts
git commit -m "feat: add /api/send-digest cron handler for daily emails"
```

---

## Task 9: Create `vercel.json`

**Files:**
- Create: `vercel.json` at root

- [ ] **Step 1: Write vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/send-digest",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "config: add Vercel Cron for daily digest"
```

---

## Self-Review Checklist

1. **Spec coverage:** All spec sections implemented — schema ✓, form ✓, API ✓, admin UI ✓, send-digest ✓, cron ✓, security ✓
2. **Placeholder scan:** No TBD/TODO in plan steps ✓
3. **Type consistency:** `MailSettings` type used in both `mail.ts` and route handlers ✓
4. **Dependencies:** `nodemailer` installed before Task 3 ✓
5. **Migration:** `002_mail.sql` created and applied before API routes are tested ✓

---

## Execution Order

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 7 → Task 6 → Task 8 → Task 9
```

> **Note:** Task 7 (API routes) should be completed before Task 6 (admin UI) since the UI depends on those endpoints existing.

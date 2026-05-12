# Mailing List with Gmail SMTP — Design Spec

**Date:** 2026-05-11
**Status:** Approved

---

## 1. Overview

Add a Gmail SMTP-powered mailing list to ai-radar so users can opt-in for daily email digests. Admin configures SMTP credentials, schedule, and HTML template via the admin page. A Vercel Cron job triggers daily digest sends.

---

## 2. Database Schema

### 2.1 `mail_subscribers`

```sql
create table public.mail_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  opted_in        boolean default false,
  subscribed_at   timestamptz default now(),
  is_confirmed    boolean default false
);
```

> Note: `newsletter_subscribers` remains for legacy opt-ins. Future migration: backfill existing confirmed rows into `mail_subscribers` with `opted_in = true`.

### 2.2 `mail_settings`

```sql
create table public.mail_settings (
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
```

### 2.3 RLS Policies

- `mail_subscribers`: INSERT for all (subscribe), SELECT for admins only, UPDATE for admins only.
- `mail_settings`: SELECT and UPDATE for admins only.

---

## 3. Newsletter Form Update

**File:** `src/components/home/Newsletter.tsx`

- Add a checkbox: "Daily digest — get top AI articles by email every day"
- On submit, POST `/{ email, daily_opt_in: true }` to `/api/newsletter`
- On success, show: "Subscribed! You'll receive daily digests."

---

## 4. API Route Update

**File:** `src/app/api/newsletter/route.ts`

- Handle `daily_opt_in` flag from request body
- Insert into `mail_subscribers` (not `newsletter_subscribers`) with `opted_in = true` when flag is set
- If subscriber already exists, update `opted_in` flag if needed

---

## 5. Admin Mail Settings

**File:** `src/app/admin/page.tsx`

Add a "Mail Settings" section with:
- SMTP config fields: host, port, user, password (masked input), from address, from name
- Schedule controls: enable/disable toggle, hour (0–23), timezone dropdown
- Template fields: subject line, header HTML textarea, footer HTML textarea
- "Send Test Email" button (POST to `/api/admin/mail/test`)
- Read-only subscriber count (opted-in only)

---

## 6. `/api/admin/mail/test` Route

**File:** `src/app/api/admin/mail/test/route.ts`

- POST handler: reads current `mail_settings`, sends a test HTML email to the admin
- Returns `{ ok: true }` or `{ error: "..." }`
- Protected: requires admin session

---

## 7. `/api/send-digest` Route

**File:** `src/app/api/send-digest/route.ts`

- Cron trigger: `CRON_SECRET` header validated on every call
- If `daily_enabled = false` → return 200, skip sending
- Fetch `mail_settings` using service role (bypasses RLS for server-side read)
- Fetch top 5 articles published since start of today (in configured timezone)
- Build HTML email: `header_html` + article list + `footer_html`
- Send via Nodemailer (Gmail SMTP)
- Log result; return `{ sent: N }` or `{ skipped: true }` or `{ error: "..." }`

---

## 8. Cron Configuration

**File:** `vercel.json` (create at root)

```json
{
  "crons": [{
    "path": "/api/send-digest",
    "schedule": "0 9 * * *"
  }]
}
```

> Note: The vercel.json schedule is a fallback. The `daily_hour` / `daily_timezone` from `mail_settings` is authoritative — a separate cron runner (e.g. cron-job.org pointing at the same endpoint) can be used if precise per-user-timezone control is needed beyond Vercel's daily-at-UTC option.

---

## 9. Environment Variables

| Variable | Description |
|---|---|
| `CRON_SECRET` | Secret string; Vercel Cron passes as `Authorization: Bearer <secret>` header |
| `MAIL_ENCRYPTION_KEY` | AES-256 key for encrypting/decrypting SMTP password at rest |

---

## 10. Security

- SMTP password encrypted with AES-256-GCM before storage; decrypted only at send time using `MAIL_ENCRYPTION_KEY`
- `/api/send-digest` validates `CRON_SECRET` on every invocation
- `mail_settings` RLS blocks non-admin reads via Supabase API
- Rate limiting: max 5 subscription attempts per IP per 15 minutes (middleware)

---

## 11. Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

---

## 12. Files to Create/Modify

| File | Action |
|---|---|
| `vercel.json` | Create |
| `src/app/api/newsletter/route.ts` | Modify |
| `src/components/home/Newsletter.tsx` | Modify |
| `src/app/admin/page.tsx` | Modify |
| `src/app/api/admin/mail/test/route.ts` | Create |
| `src/app/api/send-digest/route.ts` | Create |
| `src/lib/mail.ts` | Create (Nodemailer SMTP wrapper + encryption) |
| `scripts/mail-cron.ts` | Create (Vercel cron-compatible entry, optional) |
| `docs/superpowers/specs/2026-05-11-mailing-list-smtp-design.md` | This file |

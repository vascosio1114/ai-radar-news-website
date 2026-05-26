# Newsletter Onboarding Email — Spec

## Context
- Weekly path is dead (`newsletter_subscribers` written but never read)
- No onboarding email exists — confirmation just sends a thin welcome
- Admin cannot configure any email content beyond header/footer

## Goals
1. Admin-configurable onboarding email (subject, intro text, CTA)
2. Onboarding sent once on subscription confirmation (after welcome email)
3. Featured article picker in admin
4. Fix weekly path so weekly subscribers receive emails
5. Fix `SITE_URL` inconsistency

---

## 1. Database — `mail_settings` add onboarding fields

| Column | Type | Description |
|--------|------|-------------|
| `onboarding_enabled` | boolean | Default true |
| `onboarding_subject` | text | Email subject |
| `onboarding_intro_text` | text | Main intro paragraph |
| `onboarding_cta_text` | text | Button label |
| `onboarding_cta_url` | text | Button link |
| `onboarding_featured_article_id` | uuid | FK to articles.id, optional |

---

## 2. Email Template — `buildOnboardingHtml()`

Reuses existing `shell()`. Distinct from welcome:
- Subject: sets expectation ("你訂閱了 AI Radar — 讓我介紹一下" / "You subscribed — here's what to expect")
- Intro: 2–3 sentence welcome, cadence explanation ("你會在每週收到..."), link to recent content
- Featured article block (if article selected): title, excerpt, cover image, CTA button
- CTA button (admin-configured text + URL)
- Footer with unsubscribe link

---

## 3. Admin — new "入職 welcome" tab in mail settings

- Toggle: `onboarding_enabled`
- Text fields: `onboarding_subject`, `onboarding_intro_text`, `onboarding_cta_text`, `onboarding_cta_url`
- Article picker: search + select `onboarding_featured_article_id`
- Live preview button (renders `buildOnboardingHtml` with selected article)

---

## 4. Confirmation Route — send onboarding after welcome

In `src/app/api/confirm/[email]/route.ts`, after setting `opted_in=true` and sending welcome:
1. Fetch `onboarding_enabled`, `onboarding_*` fields from `mail_settings`
2. If `onboarding_enabled` and `onboarding_cta_url` set, call `buildOnboardingHtml(...)`
3. Send via `sendHtmlEmail()` with `onboarding_subject` as subject

---

## 5. Weekly Path Fix

Add `/api/send-weekly-digest` route:
- Reads `newsletter_subscribers` where `is_confirmed=true`
- Reads `mail_settings` for `weekly_enabled`, `weekly_hour`, `weekly_timezone`
- Uses same `buildDigestHtml()` as daily but with subject "AI Radar 每週總結"
- Admin trigger or cron with `CRON_SECRET`

**Simplify:** migrate weekly subscribers to `mail_subscribers` with a `frequency='weekly'` column, remove `newsletter_subscribers` entirely.

### Migration plan
1. Add `frequency` column default `'daily'` to `mail_subscribers`
2. Backfill existing `mail_subscribers` rows (they're all daily digest signups)
3. Move `newsletter_subscribers` data to `mail_subscribers` with `frequency='weekly'`
4. Drop `newsletter_subscribers` table
5. Add `weekly_enabled`, `weekly_hour`, `weekly_timezone` to `mail_settings`
6. Update `send-digest` to filter by `frequency='daily'`
7. Add `/api/send-weekly-digest` that filters by `frequency='weekly'`
8. Add `frequency` column to admin subscriber list display

---

## 6. `SITE_URL` Consistency

`/api/confirm/[email]/route.ts` and `/api/unsubscribe/route.ts` should import `SITE_URL` from `@/lib/site` instead of hardcoding fallback.

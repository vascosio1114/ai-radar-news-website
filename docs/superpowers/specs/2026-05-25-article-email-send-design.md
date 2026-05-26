# Article Email Send — Design Spec
**Date:** 2026-05-25
**Status:** Draft

## Overview

Add the ability to send articles as emails to subscribers via the admin panel:
1. **Single article send** — admin picks one article, sends to all subscribers
2. **Weekly summary send** — admin picks multiple articles, sends as one combined email
3. **Digest upgrade** — digest presets gain a `content_mode` option to send full article HTML instead of just excerpt

All flows are admin-controlled and configurable in the mail admin UI.

---

## Data Model

### 1. New column on `articles`

```sql
email_content text -- nullable; email-optimized HTML (inline styles, table layout)
-- Falls back to rendering excerpt if NULL
```

### 2. New column on `digest_presets`

```sql
content_mode text DEFAULT 'excerpt'
CHECK (content_mode = ANY (ARRAY['excerpt', 'full_content']))
-- 'excerpt': use excerpt + cover_image (current behavior)
-- 'full_content': use email_content (falls back to excerpt if email_content is NULL)
```

---

## Email HTML Builder

### `buildDigestHtml` changes

**Current signature:**
```typescript
articles: Array<{
  title: string;
  excerpt: string;
  url: string;
  published_at: string;
  cover_image?: string;
}>
```

**New signature:**
```typescript
articles: Array<{
  title: string;
  excerpt: string;
  url: string;
  published_at: string;
  cover_image?: string;
  email_content?: string; // optional email-optimized HTML
}>
```

When `email_content` is provided and `content_mode = 'full_content'`:
- Render `email_content` as the article body
- Show `excerpt` only in the article meta/preview line above the content

When only `excerpt` is available (or `content_mode = 'excerpt'`):
- Current behavior — show excerpt as body

---

## API Changes

### 1. `POST /api/admin/mail/send-digest` (existing)

- Reads `preset.content_mode` from the preset
- When `content_mode = 'full_content'`, includes `email_content` in the articles array passed to `buildDigestHtml`
- Ad-hoc `article_ids` override (already exists) works the same way — respects `content_mode`

### 2. New endpoint: `POST /api/admin/mail/send-article`

**Purpose:** Send a single article to all subscribers

**Request body:**
```json
{
  "article_id": "uuid",
  "settings": { ... } // optional override
}
```

**Behavior:**
- Fetches article by ID (or slug)
- Builds HTML using article's `email_content` or falls back to a rendered version of `excerpt`
- Sends to all opted-in confirmed subscribers (same batch logic as send-digest)
- Supports `?is_preview=true` and `?to=single@email.com` like existing send-digest

### 3. Existing `POST /api/send-digest` (CRON endpoint)

- No changes needed — continues to respect preset's `content_mode`

---

## Admin UI

### Mail page (`/admin/mail`)

Three send sections:

#### Section 1: Send Single Article
- Article search/picker (autocomplete by title)
- Preview button → shows email HTML in modal/panel
- "Send Test Email" button → sends to admin's email
- "Send to All Subscribers" button → triggers `POST /api/admin/mail/send-article`

#### Section 2: Send Weekly Summary (multi-article manual send)
- Multi-select article picker (same component as preset editor's article selector)
- Sends via same code path as ad-hoc digest
- Same `content_mode` logic applies

#### Section 3: Preset Editor
- Existing preset form gets a new field: `content_mode` toggle (excerpt vs full content)
- Label: "Email content mode" — radio or select: "Excerpt only" / "Full article content"

---

## Implementation Tasks

### Task 1: Database migration
- Add `email_content` column to `articles`
- Add `content_mode` column to `digest_presets`

### Task 2: API — single article send
- New `POST /api/admin/mail/send-article` route
- Reuse existing subscriber lookup and batch send logic from send-digest

### Task 3: API — content_mode in buildDigestHtml
- Update `buildDigestHtml` to accept and render `email_content`
- Update send-digest route to pass `content_mode` through

### Task 4: Admin UI — article picker for single send
- Add article search/picker component on mail page
- Wire up to send-article endpoint

### Task 5: Admin UI — content_mode on presets
- Add `content_mode` toggle to preset edit form

### Task 6: Admin UI — multi-select article picker for weekly summary
- Use existing multi-select if available, or add new picker
- Wire up to send-digest with `article_ids` override

---

## Out of Scope

- Email editor (editing `email_content` inline in admin) — handled separately
- Automated weekly send on schedule — handled by CRON setup
- Per-subscriber article personalization
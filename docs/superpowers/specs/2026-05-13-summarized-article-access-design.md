# Summarized Article Access — Design Spec

**Date:** 2026-05-13
**Topic:** Add summarized article route for unauthenticated users

---

## Overview

Display a summary version of blog posts to unregistered/unauthenticated users. At the end of the summary, prompt users to log in or create an account to access the full article. Authenticated users who visit a summary URL are redirected to the full article.

---

## Architecture

### Route Design

- **Full article:** `/[lang]/news/[slug]` — existing route, unchanged
- **Summary article:** `/[lang]/summarize/[slug]` — new route

### Content Selection Logic

When a user visits `/[lang]/summarize/[slug]`:
1. Server component checks auth via `createSupabaseServerClient`
2. **If authenticated:** return `307` redirect to `/[lang]/news/[slug]` (full article)
3. **If unauthenticated:** render the summary HTML content

This means authenticated users never see the summary page — they always get redirected to the full version.

---

## Database Changes

### Migration: Add Summary Content Columns

Add two nullable text columns to `articles`:

```sql
ALTER TABLE articles ADD COLUMN summary_content_zh TEXT;
ALTER TABLE articles ADD COLUMN summary_content TEXT;
```

- `summary_content_zh` — Chinese summary (HTML)
- `summary_content` — English/summary (HTML)

Both nullable so existing articles without summaries still work.

---

## New Page Component

**File:** `src/app/[lang]/summarize/[slug]/page.tsx`

**Implementation:**

```typescript
// Pseudocode structure
export default async function SummaryPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Authenticated → redirect to full article
  if (user) {
    return NextResponse.redirect(
      new URL(`/${params.lang}/news/${params.slug}`, request.url)
    );
  }

  // Unauthenticated → fetch and render summary
  const article = await fetchArticle(params.slug);
  const summary = localized.summary_content ?? localized.summary_content_zh;

  return (
    <SummaryArticleLayout>
      <HtmlRenderer content={summary} />
      <UnlockFullArticleCTA lang={params.lang} slug={params.slug} />
    </SummaryArticleLayout>
  );
}
```

Use `307` (Temporary Redirect) so the method is preserved if the behavior ever changes.

---

## CTA Component

**File:** `src/components/summarize/UnlockFullArticleCTA.tsx`

A styled call-to-action banner at the bottom of the summary:

- Headline: "Want to read the full article?"
- Subtext: "Sign up for free to unlock the complete content"
- Primary button: "Log in / Create account"
- Secondary link: "Back to articles"

**Behavior:**
- If user clicks the CTA while unauthenticated → redirect to login page, then back to `/[lang]/news/[slug]` after login
- The CTA should link directly to `/[lang]/news/[slug]` — the full article page will handle auth check

---

## Admin Article Editor

**File:** `src/app/admin/articles/[id]/edit/page.tsx`

Add fields for:
- `summary_content_zh` (HTML textarea, same as `content_zh`)
- `summary_content` (HTML textarea, same as `content`)

Same pattern as existing `content`/`content_zh` fields — use a code/HTML editor.

---

## Changes to Existing Files

1. **`src/app/[lang]/news/[slug]/page.tsx`** — no changes
2. **`src/middleware.ts`** — no changes (summarize route is public, no auth required)
3. **Admin article editor** — add summary content fields

---

## RLS Policy

No new RLS policies needed. The summarize route is publicly accessible (no auth check in middleware). The server component handles the auth redirect.

---

## Edge Cases

- **Article exists but has no summary:** If `summary_content` / `summary_content_zh` are null, show a message "No summary available for this article" with a link to the full article (or just link to full article directly).
- **Article not found:** `notFound()` same as full article page.
- **Authenticated user on summarize URL:** Server-side 307 redirect to full article — no summary shown, no flash.

---

## Summary

| Concern | Decision |
|---------|----------|
| Route | `/summarize/[slug]` — separate from full article |
| Auth behavior | Authenticated → 307 to full article; Unauthenticated → summary |
| CTA action | Link to full article URL; login redirect handled by full article page |
| Summary storage | `summary_content` + `summary_content_zh` in `articles` table |
| Content format | HTML (same as `content_html`) |
| Admin editing | Add fields for both summary columns |
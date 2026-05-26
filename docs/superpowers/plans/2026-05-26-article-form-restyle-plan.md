# ArticleForm Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure ArticleForm with logical field grouping and collapsible sections matching the DB schema.

**Architecture:** Single-file component change in `ArticleForm.tsx` + one-line fix in `new/page.tsx`. CollapsibleSection component already exists and is reused. API already correctly maps `email_content` → `content_html`.

**Tech Stack:** React, Next.js, Tailwind, @uiw/react-md-editor (MDEditor)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/ArticleForm.tsx` | Reorder sections, restructure form layout, fix field groupings |
| `src/app/admin/(dashboard)/articles/new/page.tsx` | Remove `author` field from initialData |

---

## Pre-condition: Read Current Form

Before starting, read: `src/components/admin/ArticleForm.tsx` (already in context above, lines 1–545)

---

### Task 1: Fix NewArticlePage initialData

**Files:**
- Modify: `src/app/admin/(dashboard)/articles/new/page.tsx:122-127`

- [ ] **Step 1: Remove `author` field from initialData**

```tsx
// BEFORE (lines 122-127):
initialData={{
  category: "AI 文章",
  published_at: new Date().toISOString().split("T")[0],
  is_published: true,
  author: "RADAR AI Studio",  // <-- REMOVE THIS LINE
} as Partial<ArticleFormData>}

// AFTER:
initialData={{
  category: "AI 文章",
  published_at: new Date().toISOString().split("T")[0],
  is_published: true,
} as Partial<ArticleFormData>}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/\(dashboard\)/articles/new/page.tsx
git commit -m "fix(articles): remove dead author field from new article initialData"
```

---

### Task 2: Restructure ArticleForm sections

**Files:**
- Modify: `src/components/admin/ArticleForm.tsx`

**Field order in the form — new layout:**

1. **INFO section** (always visible):
   - `published_at` (date input)
   - `slug` (text input)
   - `is_featured` + `is_published` (checkboxes, at bottom of form)

2. **ENGLISH INFO section** (collapsed by default, ChevronRight closed):
   - `title` (English Title)
   - `excerpt` (English Excerpt)
   - `content` (English Content — MDEditor)
   - `summary_content` (English Summary Content — MDEditor)

3. **CHINESE INFO section** (collapsed by default, ChevronRight closed):
   - `title_zh` (中文標題)
   - `excerpt_zh` (中文摘要)
   - `content_zh` (中文內容 — MDEditor)

4. **MEDIA section** (always visible):
   - `cover_image` (URL + upload)
   - `category` (dropdown)
   - `tags` (multi-input)

5. **EMAIL CONTENT section** (collapsed, at bottom):
   - `email_content` → maps to DB `content_html` column via API

**The `CollapsibleSection` component (lines 102–129) already exists and is used for `english` and `chinese`. Keep it but rename the `english` key to `english_info` and `chinese` to `chinese_info` for clarity.**

**Initial expanded state (line 92-95):**
```tsx
const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
  info: true,       // INFO always open
  english_info: false,
  chinese_info: false,
  email_content: false,
});
```

**CollapsibleSection titles:**
- "ENGLISH INFO" (sectionKey: `english_info`)
- "CHINESE INFO" (sectionKey: `chinese_info`)
- "EMAIL CONTENT" (sectionKey: `email_content`)

**The EMAIL CONTENT section:**
- Label: `Email 內容（HTML）` with helper text `對應 DB content_html 欄位`
- Keep as `data-color-mode="auto"` textarea with `font-mono text-xs`
- No MDEditor needed — it's raw HTML for email

**Keep existing fields that are NOT being moved:**
- All MDEditor configs remain `height={400}, preview="edit"`
- Image upload handler unchanged
- Tag input logic unchanged
- Slug generation `generateSlug(date, title)` unchanged
- `handleTitleChange` generates slug from `title` and `published_at` — this is correct (English title drives slug)

**The `is_featured` and `is_published` checkboxes move from the bottom of the form to the bottom of the INFO section.**

---

### Task 3: Verify and test

**Verify:**
1. Load `/admin/articles/new` — INFO section visible, English/Chinese sections collapsed
2. Click ENGLISH INFO chevron → expands to show English Title, Excerpt, Content, Summary
3. Click CHINESE INFO chevron → expands to show 中文標題, 中文摘要, 中文內容
4. Click EMAIL CONTENT chevron → expands to show Email HTML textarea
5. Enter English Title → slug auto-generates from date + title
6. Cover image URL + upload works
7. Category dropdown shows 6 options
8. Tags input works (Enter to add)
9. is_featured and is_published checkboxes visible in INFO section
10. Submit creates article successfully

**Post condition:** No `author` warning in console on new article page.
# ArticleForm Restructure SPEC

## Goal

Restructure the ArticleForm to use a logical field grouping that matches the DB schema, with collapsible sections and proper field naming.

## Source of Truth: DB Schema

**articles table columns:**
```
slug, title, title_zh, excerpt, excerpt_zh,
cover_image, category, tags, author,
content, content_zh, summary_content, summary_content_zh,
content_html, is_published, is_featured, is_premium, is_ai_generated,
published_at, reading_time, views, source_url, source_name,
created_at, updated_at, search_vector
```

Note: `content_html` is the DB column. The form sends `email_content`. **API maps `email_content` → `content_html`.**

---

## Proposed Form Layout

### Section 1: INFO (always visible)
| Field | Type | Notes |
|-------|------|-------|
| 發佈日期 (Published Date) | date input | Format YYYY-MM-DD |
| Slug | text input | auto-generated from date+title, lowercase-only |
| is_featured | checkbox | 置頂文章 |
| is_published | checkbox | 已發佈 |

### Section 2: ENGLISH INFO (collapsed by default)
| Field | Type | DB column | Notes |
|-------|------|-----------|-------|
| English Title | text input | `title` | Required, drives auto-slug |
| English Excerpt | textarea | `excerpt` | Short description |
| English Content | Markdown editor | `content` | Main article body |
| English Summary Content | Markdown editor | `summary_content` | For email digest |

### Section 3: CHINESE INFO (collapsed by default)
| Field | Type | DB column | Notes |
|-------|------|-----------|-------|
| 中文標題 | text input | `title_zh` | Optional |
| 中文摘要 | textarea | `excerpt_zh` | Optional |
| 中文內容 | Markdown editor | `content_zh` | Chinese article body |

### Section 4: MEDIA (always visible)
| Field | Type | DB column | Notes |
|-------|------|-----------|-------|
| 封面圖 (Cover Image) | URL + upload | `cover_image` | |
| 分類 (Category) | dropdown | `category` | |
| 標籤 (Tags) | multi-input | `tags` | Enter to add |

### Section 5: EMAIL CONTENT (collapsed, low priority)
| Field | Type | DB column | Notes |
|-------|------|-----------|-------|
| Email Content (HTML) | textarea (mono) | `content_html` | For email; falls back to summary |

---

## Key Changes From Current Form

1. **Reorder sections**: INFO first (date/slug/publish), then ENGLISH INFO, then CHINESE INFO, then MEDIA
2. **English Title drives slug**: Currently "英文標題" is the first field but in INFO section; moved to ENGLISH INFO
3. **Collapsed by default**: ENGLISH INFO and CHINESE INFO collapse to reduce visual noise
4. **Remove duplicate summary fields from wrong section**: Currently summary fields are in "English Content" section but they belong in email context
5. **Email content maps to `content_html`**: API already does this, document it clearly
6. **Remove dead `author` field**: NewArticlePage passes `author` in initialData but `ArticleFormData` has no author field → remove from NewArticlePage

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/ArticleForm.tsx` | Reorder sections, add collapsibles, rename/relabel fields |
| `src/app/admin/(dashboard)/articles/new/page.tsx` | Remove `author` from initialData |

---

## Collapsible Section Component (reuse existing)

The form already has `CollapsibleSection` component — just needs to be applied to ENGLISH INFO and CHINESE INFO with `expanded: false` by default.

---

## Implementation Notes

- Auto-slug: `generateSlug(date, title)` — date from published_at field, title from English Title
- Section toggle state: `{ info: true, english: false, chinese: false, email: false }` — INFO always open
- `email_content` field in form → API maps to `content_html` column in DB
- No new DB columns needed
# Bug Fix: Bilingual Articles Listed Separately Instead of as One Entry

- **Started**: 2026-05-24
- **Severity**: P1
- **Status**: In Progress

## Diagnosis

### Symptom
In `/admin/articles`, Chinese and English versions of the same article are displayed as **two separate rows** (e.g., `google-pics` and `google-pics-zh` appear separately), when they should be **one entry** with both languages shown in separate columns.

### Root Cause
The database schema was designed correctly with `title`/`title_zh`, `content`/`content_zh`, `excerpt`/`excerpt_zh`, and `summary_content`/`summary_content_zh` columns in the `articles` table. However, the **data was being inserted incorrectly**: articles were created as **two separate rows** — one with English slug (e.g., `google-pics`) and one with Chinese slug suffix (e.g., `google-pics-zh`), both storing BOTH languages in their respective `title`/`title_zh`/`content`/`content_zh` fields. This caused duplicate entries in the admin list.

### Data Migration Applied
Deleted 10 rows with `-zh` suffix slugs. The remaining 10 English-slug rows now contain complete bilingual content (both `content` and `content_zh` are populated).

### Files Involved
- `src/app/api/admin/articles/route.ts` — returns raw rows without grouping
- `src/app/admin/(dashboard)/articles/page.tsx` — table displays each row independently, only shows `title` column
- `src/app/admin/(dashboard)/articles/[id]/edit/page.tsx` — edit page works correctly (loads single article by ID)
- `src/components/admin/ArticleForm.tsx` — form has all bilingual fields but creates/updates single articles

## Plan

### Tasks
- [ ] Modify `GET /api/admin/articles` to return ONE article object per row, with bilingual fields (`title`, `title_zh`, `excerpt`, `excerpt_zh`, `content`, `content_zh`, `summary_content`, `summary_content_zh`)
- [ ] Update admin articles list table columns to display: 中文標題, 英文標題, 分類, 狀態, 瀏覽, 操作
- [ ] Update table to show both `title_zh` and `title` in separate cells

### Expected Outcome
Each article appears as a single row in the admin table, with separate columns for Chinese and English titles/content. No more duplicate rows for the same article.

## Implementation

### Changes Made
| File | Change | Rationale |
|------|--------|-----------|
| `src/app/admin/(dashboard)/articles/page.tsx` | Updated Article type + table columns | Added `title_zh`, `content_zh`, etc. to type; split single "標題" column into "中文標題" + "英文標題" |
| `supabase` | Deleted 10 duplicate `-zh` rows via migration | Removed redundant rows; English-slug rows already have both `content` and `content_zh` |

## Verification

### Test Results
- Database migration: Deleted 10 rows with `-zh` suffix slugs (`google-pics-zh`, `token-economy-zh`, etc.)
- Remaining data verified: 10 rows remain, each has both `content` (English) and `content_zh` (Chinese) populated
- Type check: No errors in changed frontend files

### Regression Status
- [x] Duplicate zh rows removed
- [ ] Full dev server test pending

### Sign-off
- [ ] Fix confirmed working (needs dev server test)
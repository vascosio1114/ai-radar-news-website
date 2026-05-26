# ArticleForm Bug Fixes SPEC

## Problems Identified

### 1. Logic Problems

**a) Type mismatch - `author` field passed but not in interface**
- `NewArticlePage` passes `author: "RADAR AI Studio"` in `initialData`
- `ArticleFormData` interface does NOT have `author` field
- This is ignored at runtime but indicates data flow confusion

**b) Duplicate content in form fields (reported by user)**
- The form may display content twice if API returns both `content`/`content_zh` and the form renders them sequentially
- The form displays `summary_content` (labeled "英文摘要內容") and `summary_content_zh` (labeled "中文摘要內容") separately — this is correct, not duplicate

**c) Email content placeholder confusing**
- Placeholder shows `<p>為電子郵件優化的 HTML 內容...</p>` which looks like actual content
- Description says "如留空，則使用摘要" which is good, but the placeholder styling is confusing

### 2. UI/UX Problems

**a) Instruction text mixing with content**
- Slug field has hint text: "只允許小寫英文字母、數字和連字符；中文標題會自動 fallback 成 blog-post。"
- Tags field has hint: "輸入標籤後按 Enter"
- Both are visible as text but should be styled as helper text or ghost placeholder, not mixed label text

**b) All fields visible at once — overwhelming density**
- English content section shows: title, excerpt, content, summary_content, summary_content_zh all in sequence
- Chinese content section shows: title_zh, excerpt_zh, content_zh
- No visual grouping or collapsible sections

**c) No visible Save/Publish button — looking at screenshot, actions ARE at bottom**
- The submit button says "發佈文章" or "儲存草稿" — this is correct

**d) Date format ambiguous in display**
- Shows "24/05/2026" — DD/MM vs MM/DD is locale-dependent
- No format indicator shown to user

## Fixes Required

### Fix 1: Remove extraneous `author` from NewArticlePage initialData
- File: `src/app/admin/(dashboard)/articles/new/page.tsx`
- Remove `author: "RADAR AI Studio"` from initialData (not in ArticleFormData interface)

### Fix 2: Style hint/placeholder text properly in ArticleForm
- File: `src/components/admin/ArticleForm.tsx`
- Slug field hint: keep as `<p className="mt-1 text-xs text-ink-500">` — this is correct style, just verify it's not mixed into input
- Tags field placeholder: "輸入標籤後按 Enter" — this IS the placeholder text, which is correct
- The issue might be that on dark mode, placeholder text isn't visible enough

### Fix 3: Improve visual grouping — add collapsible sections
- Group English fields into a collapsible "English Content" section
- Group Chinese fields into a collapsible "中文內容" section
- Collapse by default, expand on click
- This reduces overwhelming density

### Fix 4: Improve email content placeholder clarity
- Change placeholder from `<p>為電子郵件優化的 HTML 內容...</p>` to `為電子郵件優化的 HTML 內容（留空則使用摘要）...`
- Use a placeholder style that is clearly not content (lighter text color, italic)

### Fix 5: Add date format indicator
- Show date format hint below date input: "格式：YYYY-MM-DD" or use HTML5 date placeholder

## Files to Modify

1. `src/app/admin/(dashboard)/articles/new/page.tsx` — remove `author` field
2. `src/components/admin/ArticleForm.tsx` — all UI fixes above

## Testing
- Load new article page: no `author` warning
- Load edit article page: fields not duplicated
- Collapsible sections work (expand/collapse)
- Email placeholder clearly placeholder, not content
- Date input shows format hint
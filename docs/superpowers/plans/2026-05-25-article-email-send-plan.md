# Article Email Send — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable admins to send single articles and multi-article summaries as emails, with an option to include full article HTML instead of just excerpts.

**Architecture:** Two new DB columns (`email_content` on articles, `content_mode` on digest_presets). A new API route for single article sends. `buildDigestHtml` extended to support full article body rendering. Article API enhanced with search and `email_content` storage. Admin UI gets three new sections: single article send, multi-article weekly summary, and preset content mode toggle.

**Tech Stack:** Next.js App Router, Supabase (Postgres), nodemailer/mail.ts, existing admin UI with tabs.

---

## File Map

```
src/
  lib/
    digest-html.ts          # Modified: add email_content + contentMode to articles param
    mail.ts                # No changes needed
    email-templates.ts     # No changes needed — shell is reusable
  app/
    api/
      admin/
        mail/
          send-article/     # New directory
            route.ts       # New: POST single article send
          presets/
            route.ts       # Modified: POST inserts content_mode
            [id]/
              route.ts     # Modified: PATCH updates content_mode
        articles/
          route.ts          # Modified: GET supports search + returns email_content
          [id]/
            route.ts       # Modified: PATCH accepts + stores email_content
      admin/
        mail/
          send-digest/
            route.ts       # Modified: reads content_mode from preset
      send-digest/
        route.ts           # Modified: CRON endpoint reads content_mode
    admin/(dashboard)/
      mail/
        page.tsx           # Modified: add "Send Article" + "Weekly Summary" tabs
  supabase/
    migrations/
      2026-05-25-article-email-send.sql  # New: DB migration
```

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/2026-05-25-article-email-send.sql`

- [ ] **Step 1: Write migration**

```sql
-- Add email-optimized HTML content column to articles
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS email_content text;

-- Add content_mode to digest_presets
ALTER TABLE digest_presets
  ADD COLUMN IF NOT EXISTS content_mode text
  NOT NULL DEFAULT 'excerpt'
  CHECK (content_mode = ANY (ARRAY['excerpt', 'full_content']));

-- Comments for documentation
COMMENT ON COLUMN articles.email_content IS 'Email-optimized HTML body. Falls back to excerpt if NULL.';
COMMENT ON COLUMN digest_presets.content_mode IS 'excerpt = show excerpt only; full_content = use email_content.';
```

- [ ] **Step 2: Apply migration**

Run: `npx supabase db push` or apply via MCP `apply_migration`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/2026-05-25-article-email-send.sql
git commit -m "feat(mail): add email_content and content_mode columns"
```

---

## Task 2: Extend buildDigestHtml for Full Content

**Files:**
- Modify: `src/lib/digest-html.ts` — add `email_content` to articles param type

- [ ] **Step 1: Write failing test**

```typescript
// src/lib/__tests__/digest-html.test.ts (or append to existing test file)
import { buildDigestHtml } from "../digest-html";

describe("buildDigestHtml - full content mode", () => {
  it("renders email_content when provided and content_mode is full_content", () => {
    const html = buildDigestHtml({
      headerHtml: "<h1>Header</h1>",
      footerHtml: "<p>Footer</p>",
      articles: [
        {
          title: "Test Article",
          excerpt: "This is the excerpt shown in digest mode",
          url: "https://example.com/news/test-article",
          published_at: "2026-05-25T10:00:00Z",
          email_content: "<p><strong>Full article body with</strong> email-optimized HTML.</p>",
        },
      ],
      contentMode: "full_content",
    });
    expect(html).toContain("Full article body with");
    expect(html).toContain("email-optimized HTML");
    // excerpt should NOT appear as article body in full_content mode
    expect(html).not.toContain("This is the excerpt shown in digest mode");
  });

  it("renders excerpt when email_content is absent even in full_content mode", () => {
    const html = buildDigestHtml({
      headerHtml: "",
      footerHtml: "",
      articles: [
        {
          title: "Test Article",
          excerpt: "Fallback excerpt",
          url: "https://example.com/news/test-article",
          published_at: "2026-05-25T10:00:00Z",
          // no email_content
        },
      ],
      contentMode: "full_content",
    });
    expect(html).toContain("Fallback excerpt");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --testPathPattern="digest-html" --no-coverage`
Expected: FAIL — `contentMode` parameter does not exist

- [ ] **Step 3: Implement minimal code**

Replace `buildDigestHtml` function body. Updated signature and article shape:

```typescript
export type ArticleForDigest = {
  title: string;
  excerpt: string;
  url: string;
  published_at: string;
  cover_image?: string;
  email_content?: string; // email-optimized HTML body
};

export function buildDigestHtml(params: {
  headerHtml: string;
  footerHtml: string;
  articles: ArticleForDigest[];
  emailBodyTemplate?: string;
  dateStr?: string;
  unsubscribeUrl?: string;
  contentMode?: "excerpt" | "full_content"; // NEW: controls article body render
}): string {
  const { headerHtml, footerHtml, articles, emailBodyTemplate, dateStr, unsubscribeUrl, contentMode = "excerpt" } = params;

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

      // Determine article body based on contentMode
      let articleBody: string;
      if (contentMode === "full_content" && a.email_content) {
        articleBody = a.email_content;
      } else {
        articleBody = `<p style="margin:0;color:#333;font-size:15px;">${escapeHtml(a.excerpt)}</p>`;
      }

      return `
        <div style="margin-bottom:32px;">
          ${imgTag}
          <h3 style="margin:0 0 8px;font-size:18px;"><a href="${a.url}" style="color:#1a1a1a;text-decoration:none;">${a.title}</a></h3>
          <p style="margin:0 0 8px;color:#666;font-size:14px;">${date}</p>
          ${articleBody}
          <a href="${a.url}" style="display:inline-block;margin-top:12px;font-size:14px;color:#2563eb;text-decoration:none;">Read more →</a>
        </div>
      `;
    })
    .join("<hr style='border:none;border-top:1px solid #eee;margin:24px 0;' />");

  if (emailBodyTemplate) {
    return renderDigestTemplate(emailBodyTemplate, {
      articles: articleRows,
      header: headerHtml,
      footer: footerHtml,
      date: dateStr ?? "",
      unsubscribe_url: unsubscribeUrl ?? "",
    });
  }

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

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --testPathPattern="digest-html" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/digest-html.ts src/lib/__tests__/digest-html.test.ts
git commit -m "feat(mail): support full_content mode in buildDigestHtml"
```

---

## Task 3: Update send-digest APIs to pass content_mode

**Files:**
- Modify: `src/app/api/admin/mail/send-digest/route.ts`
- Modify: `src/app/api/send-digest/route.ts` (CRON endpoint)

- [ ] **Step 1: Read current file to find exact line numbers**

Read `src/app/api/admin/mail/send-digest/route.ts` and note the lines around where the preset is fetched and where `buildDigestHtml` is called.

- [ ] **Step 2: Update admin send-digest preset fetch to include content_mode**

Find the preset fetch block and add `content_mode` to the select:

```typescript
  // Find this line:
  .select("*")
  // Change to:
  .select("*, content_mode")
```

- [ ] **Step 3: Update admin send-digest buildDigestHtml call to pass contentMode**

In the `buildDigestHtml` call, add `contentMode`:

```typescript
  const contentMode = preset?.content_mode ?? "excerpt";

  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr,
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode: contentMode, // NEW: pass content_mode
  });
```

- [ ] **Step 4: Update CRON send-digest (GET /api/send-digest)**

Read `src/app/api/send-digest/route.ts`. Find the default preset fetch and add `content_mode` to the select, then pass `contentMode` to `buildDigestHtml` the same way.

```typescript
  // Default preset fetch — add content_mode:
  .select("*, content_mode")

  // buildDigestHtml call — add contentMode:
  const contentMode = defaultPreset?.content_mode ?? "excerpt";
  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: articlesWithUrl,
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr,
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode: contentMode,
  });
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/mail/send-digest/route.ts src/app/api/send-digest/route.ts
git commit -m "feat(mail): pass content_mode from preset to buildDigestHtml"
```

---

## Task 3b: Article API — include email_content and support search

**Files:**
- Modify: `src/app/api/admin/articles/route.ts` (GET handler)
- Modify: `src/app/api/admin/articles/[id]/route.ts` (PATCH handler)

The admin mail UI's article search/picker calls `GET /api/admin/articles?search=...`. This task ensures the GET endpoint (a) supports text search and (b) returns `email_content` so the send-article endpoint can use it.

- [ ] **Step 1: Update GET to support search query param and return email_content**

In `src/app/api/admin/articles/route.ts`, find the GET handler. Replace the select with `id, slug, title, email_content` and add a `.ilike` filter when a `search` query param is present:

```typescript
export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.adminDb;

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    let query = supabase
      .from("articles")
      .select("id, slug, title, excerpt, email_content, published_at, is_published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search && search.length >= 2) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;
    // ...
  }
}
```

- [ ] **Step 2: Update PATCH normalizeArticlePayload to pass email_content**

In `src/app/api/admin/articles/[id]/route.ts`, add `email_content` to `normalizeArticlePayload`:

```typescript
function normalizeArticlePayload(body: Record<string, unknown>) {
  // ... existing fields ...
  return {
    // ... existing fields ...
    email_content: body.email_content ? String(body.email_content) : null, // NEW
  };
}
```

- [ ] **Step 3: Update POST to insert email_content**

In `src/app/api/admin/articles/route.ts` POST handler, add `email_content` to the insert:

```typescript
.insert({
  // ... existing fields ...
  email_content: body.email_content ? String(body.email_content) : null, // NEW
})
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/articles/route.ts src/app/api/admin/articles/[id]/route.ts
git commit -m "feat(mail): support search and email_content in admin articles API"
```

---

## Task 4: New POST /api/admin/mail/send-article endpoint

**Files:**
- Create: `src/app/api/admin/mail/send-article/route.ts`

- [ ] **Step 1: Write the endpoint**

```typescript
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendHtmlEmail } from "@/lib/mail";
import { buildDigestHtml } from "@/lib/digest-html";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const serverClient = createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { article_id, to } = body;

  if (!article_id) {
    return NextResponse.json({ error: "article_id is required" }, { status: 400 });
  }

  const settings = body.settings
    ?? await admin.from("mail_settings").select("*").limit(1).single().then(r => r.data);

  if (!settings) {
    return NextResponse.json({ error: "No mail settings configured" }, { status: 400 });
  }

  // Fetch article by ID or slug
  const { data: article } = await admin
    .from("articles")
    .select("id, slug, title, excerpt, email_content, cover_image, published_at, category")
    .or(`id.eq.${article_id},slug.eq.${article_id}`)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const articleUrl = `${SITE_URL}/news/${article.slug}`;

  // Build email HTML — single article render
  const html = buildDigestHtml({
    headerHtml: settings.email_header_html || "",
    footerHtml: settings.email_footer_html || "",
    articles: [{
      title: article.title,
      excerpt: article.excerpt || "",
      url: articleUrl,
      published_at: article.published_at,
      cover_image: article.cover_image || undefined,
      email_content: article.email_content || undefined,
    }],
    emailBodyTemplate: settings.email_body_template || undefined,
    dateStr: new Date().toLocaleDateString("zh-HK", { year: "numeric", month: "long", day: "numeric" }),
    unsubscribeUrl: `${SITE_URL}/unsubscribe`,
    contentMode: "full_content", // always full_content for single article send
  });

  const subject = `AI Radar: ${article.title}`;

  // Preview mode — return HTML without sending
  if (body.is_preview) {
    return NextResponse.json({ html, articleId: article.id, articleTitle: article.title });
  }

  // Test send to single address
  if (to) {
    const result = await sendHtmlEmail(settings, to, `TEST: ${subject}`, html);
    if (!result.sent) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to, type: "test" });
  }

  // Send to all confirmed subscribers
  const { data: subscribers } = await admin
    .from("mail_subscribers")
    .select("email")
    .eq("opted_in", true)
    .eq("is_confirmed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, error: "No confirmed subscribers" });
  }

  let sent = 0;
  const errors: string[] = [];
  const BATCH_SIZE = 10;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((sub) =>
        sendHtmlEmail(settings, sub.email, subject, html)
          .then((r) => ({ email: sub.email, ...r }))
          .catch((err) => ({ email: sub.email, sent: false, error: err instanceof Error ? err.message : String(err) }))
      )
    );
    for (const r of results) {
      if (r.sent) sent++;
      else errors.push(`${r.email}: ${r.error}`);
    }
  }

  return NextResponse.json({ sent, total: subscribers.length, errors, articleTitle: article.title });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/mail/send-article/route.ts
git commit -m "feat(mail): add POST /api/admin/mail/send-article endpoint"
```

---

## Task 5: Update digest presets CRUD for content_mode

**Files:**
- Modify: `src/app/api/admin/mail/presets/route.ts` (POST handler)
- Modify: `src/app/api/admin/mail/presets/[id]/route.ts` (PATCH handler — find this file first)

- [ ] **Step 1: Find the [id] route file**

Run: `Get-ChildItem -Recurse -Path src/app/api/admin/mail/presets -Filter "*.ts"`

- [ ] **Step 2: Update POST — add content_mode to insert**

In `presets/route.ts`, find the insert block and add `content_mode`:

```typescript
  // In the insert call around line 45-55:
  .insert({
    name: body.name,
    description: body.description ?? null,
    mode: body.mode,
    article_ids: body.article_ids ?? [],
    criteria: body.criteria ?? {},
    is_default: body.is_default ?? false,
    content_mode: body.content_mode ?? "excerpt", // NEW
  })
```

- [ ] **Step 3: Update PATCH — add content_mode to update**

In `[id]/route.ts`, find the update block and add `content_mode`:

```typescript
  // In the update call:
  await supabase
    .from("digest_presets")
    .update({
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      mode: body.mode ?? undefined,
      article_ids: body.article_ids ?? undefined,
      criteria: body.criteria ?? undefined,
      is_default: body.is_default ?? undefined,
      content_mode: body.content_mode ?? undefined, // NEW
    })
    .eq("id", id);
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/mail/presets/route.ts src/app/api/admin/mail/presets/[id]/route.ts
git commit -m "feat(mail): support content_mode in digest_presets CRUD"
```

---

## Task 6: Admin UI — Add article send sections to mail page

**Files:**
- Modify: `src/app/admin/(dashboard)/mail/page.tsx`

This is the most substantial UI task. Three sub-sections need to be added to the mail page, all below the existing tabbed content and above the "Action Footer" (send digest button area).

- [ ] **Step 1: Add new tab types**

Add to the `Tab` type union:

```typescript
type Tab = "smtp" | "schedule" | "template" | "subscribers" | "send-article" | "weekly-summary";
```

- [ ] **Step 2: Add tab definitions to NAV_TABS**

```typescript
{ id: "send-article", label: "發送文章", icon: Mail },
{ id: "weekly-summary", label: "每週總結", icon: Send },
```

- [ ] **Step 3: Add Send Article section**

In the page component, add state and handler:

```typescript
const [selectedArticle, setSelectedArticle] = useState<{ id: string; title: string } | null>(null);
const [articleSearch, setArticleSearch] = useState("");
const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; slug: string }>>([]);
const [sendingArticle, setSendingArticle] = useState(false);

const handleArticleSearch = async (query: string) => {
  setArticleSearch(query);
  if (query.length < 2) { setSearchResults([]); return; }
  const res = await fetch(`/api/admin/articles?search=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  setSearchResults(data.articles ?? []);
};

const handleSendArticle = async () => {
  if (!selectedArticle) return;
  if (!confirm(`確定發送「${selectedArticle.title}」給所有訂閱者？`)) return;
  setSendingArticle(true);
  const res = await fetch("/api/admin/mail/send-article", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ article_id: selectedArticle.id }),
  });
  const data = await res.json();
  if (res.ok) {
    setStatusMsg({ type: "success", text: `已發送給 ${data.sent}/${data.total} 位訂閱者` });
  } else {
    setStatusMsg({ type: "error", text: data.error || "發送失敗" });
  }
  setSendingArticle(false);
};
```

- [ ] **Step 4: Add Send Weekly Summary (multi-select) section**

```typescript
const [weeklyArticles, setWeeklyArticles] = useState<Array<{ id: string; title: string }>>([]);
const [weeklySearch, setWeeklySearch] = useState("");
const [weeklySearchResults, setWeeklySearchResults] = useState<Array<{ id: string; title: string }>>([]);
const [sendingWeekly, setSendingWeekly] = useState(false);

const handleWeeklySearch = async (query: string) => {
  setWeeklySearch(query);
  if (query.length < 2) { setWeeklySearchResults([]); return; }
  const res = await fetch(`/api/admin/articles?search=${encodeURIComponent(query)}&limit=5`);
  const data = await res.json();
  setWeeklySearchResults(data.articles ?? []);
};

const addToWeekly = (article: { id: string; title: string }) => {
  if (weeklyArticles.find((a) => a.id === article.id)) return;
  setWeeklyArticles((prev) => [...prev, article]);
};

const removeFromWeekly = (id: string) => {
  setWeeklyArticles((prev) => prev.filter((a) => a.id !== id));
};

const handleSendWeeklySummary = async () => {
  if (weeklyArticles.length === 0) return;
  if (!confirm(`確定發送 ${weeklyArticles.length} 篇文章給所有訂閱者？`)) return;
  setSendingWeekly(true);
  const res = await fetch("/api/admin/mail/send-digest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ article_ids: weeklyArticles.map((a) => a.id) }),
  });
  const data = await res.json();
  if (res.ok) {
    setStatusMsg({ type: "success", text: `已發送給 ${data.sent}/${data.total} 位訂閱者` });
  } else {
    setStatusMsg({ type: "error", text: data.error || "發送失敗" });
  }
  setSendingWeekly(false);
};
```

- [ ] **Step 5: Add JSX for the two new tabs**

Add two new conditional blocks after the existing tab blocks (before the Action Footer div):

```tsx
{/* Send Single Article Tab */}
{activeTab === "send-article" && (
  <SectionCard
    title="發送單篇文章"
    description="選擇一篇文章發送給所有訂閱者"
    icon={<Mail className="h-4 w-4" />}
  >
    <div className="space-y-4">
      <Field label="搜尋文章" htmlFor="article-search">
        <input
          id="article-search"
          type="text"
          value={articleSearch}
          onChange={(e) => handleArticleSearch(e.target.value)}
          placeholder="輸入文章標題搜尋..."
          className="input-field"
        />
      </Field>
      {searchResults.length > 0 && (
        <ul className="rounded-xl border border-ink-700 divide-y divide-ink-700 overflow-hidden">
          {searchResults.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => { setSelectedArticle(a); setSearchResults([]); setArticleSearch(""); }}
                className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-ink-800 transition"
              >
                {a.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedArticle && (
        <div className="flex items-center justify-between rounded-xl bg-ink-800 px-4 py-3">
          <span className="text-sm font-medium text-ink-100">{selectedArticle.title}</span>
          <button
            type="button"
            onClick={() => setSelectedArticle(null)}
            className="text-xs text-ink-400 hover:text-red-400"
          >
            移除
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={async () => {
            if (!selectedArticle) return;
            const res = await fetch("/api/admin/mail/send-article", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ article_id: selectedArticle.id, is_preview: true }),
            });
            const data = await res.json();
            if (data.html) { setPreviewHtml(data.html); setShowPreview(true); }
          }}
          disabled={!selectedArticle}
          className="flex items-center gap-2 rounded-xl border border-ink-700 px-4 py-2 text-sm text-ink-300 hover:bg-ink-800 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" /> 預覽
        </button>
        <button
          type="button"
          onClick={handleSendArticle}
          disabled={!selectedArticle || sendingArticle}
          className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {sendingArticle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          發送給所有訂閱者
        </button>
      </div>
    </div>
  </SectionCard>
)}

{/* Weekly Summary Tab */}
{activeTab === "weekly-summary" && (
  <SectionCard
    title="每週總結"
    description="選擇多篇文章作為每週總結發送"
    icon={<Send className="h-4 w-4" />}
  >
    <div className="space-y-4">
      <Field label="搜尋文章" htmlFor="weekly-search">
        <input
          id="weekly-search"
          type="text"
          value={weeklySearch}
          onChange={(e) => handleWeeklySearch(e.target.value)}
          placeholder="輸入文章標題搜尋..."
          className="input-field"
        />
      </Field>
      {weeklySearchResults.length > 0 && (
        <ul className="rounded-xl border border-ink-700 divide-y divide-ink-700 overflow-hidden">
          {weeklySearchResults.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => { addToWeekly(a); setWeeklySearchResults([]); setWeeklySearch(""); }}
                className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-ink-800 transition"
              >
                + {a.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      {weeklyArticles.length > 0 && (
        <div className="space-y-2">
          {weeklyArticles.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl bg-ink-800 px-4 py-2">
              <span className="text-sm text-ink-200">{a.title}</span>
              <button
                type="button"
                onClick={() => removeFromWeekly(a.id)}
                className="text-xs text-ink-400 hover:text-red-400"
              >
                移除
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSendWeeklySummary}
          disabled={weeklyArticles.length === 0 || sendingWeekly}
          className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {sendingWeekly ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          發送 {weeklyArticles.length} 篇文章給所有訂閱者
        </button>
      </div>
    </div>
  </SectionCard>
)}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/\(dashboard\)/mail/page.tsx
git commit -m "feat(admin): add single article and weekly summary send UI"
```

---

## Task 7: Admin UI — content_mode on preset form

**Files:**
- Modify: the preset edit/create component (find in `src/app/admin/(dashboard)/mail/presets/`)

- [ ] **Step 1: Find the preset form component**

Run: `Get-ChildItem -Recurse -Path "src/app/admin" -Filter "*.tsx" | Select-String -Pattern "content_mode" -List`

If not found, look for the preset edit page or component in the mail presets area.

- [ ] **Step 2: Add content_mode radio/toggle to form**

In the preset form, add after the `mode` field:

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-ink-300">郵件內容模式</label>
  <div className="flex gap-4">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="content_mode"
        value="excerpt"
        defaultChecked={preset?.content_mode === "excerpt" || !preset?.content_mode}
      />
      <span className="text-sm text-ink-200">僅摘要</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="content_mode"
        value="full_content"
        defaultChecked={preset?.content_mode === "full_content"}
      />
      <span className="text-sm text-ink-200">完整文章內容</span>
    </label>
  </div>
  <p className="text-xs text-ink-500">
    「完整文章內容」使用 email_content 欄位（若未設定則使用摘要）
  </p>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add <preset-form-file>
git commit -m "feat(admin): add content_mode toggle to preset form"
```

---

## Spec Coverage Check

| Spec section | Task |
|---|---|
| `email_content` column on articles | Task 1 |
| `content_mode` column on digest_presets | Task 1 |
| `buildDigestHtml` full content rendering | Task 2 |
| `send-digest` (admin) respects content_mode | Task 3 |
| `send-digest` (CRON) respects content_mode | Task 3 |
| Article API: search + email_content in GET/PATCH/POST | Task 3b |
| `POST /api/admin/mail/send-article` | Task 4 |
| Preset CRUD with content_mode | Task 5 |
| Admin UI: single article send | Task 6 |
| Admin UI: weekly summary send | Task 6 |
| Admin UI: content_mode on preset form | Task 7 |

## Self-Review Notes

- `email_content` in the DB: nullable text, no migration default needed (NULL = fallback to excerpt)
- `content_mode` default: `'excerpt'` in the DB column default — existing presets without this column get `excerpt` behavior automatically
- Single article send always uses `contentMode = "full_content"` — even if `email_content` is NULL, it falls back to excerpt gracefully via the logic in `buildDigestHtml`
- Weekly summary uses existing `send-digest` ad-hoc path with `article_ids` override, which already has the `content_mode` flow from Task 3
- API authentication in send-article follows the same pattern as send-digest: admin auth via `adminAuth` helper
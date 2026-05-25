# Phase 3 & 4 Implementation Plan

## Context
AI Radar newsletter site built with Next.js 14 + Supabase. Current phase completes markdown rendering and adds search/pagination/category filters.

---

## Phase 3: Markdown Rendering

### Task 3.1 — Install markdown dependencies
- [ ] Install `react-markdown`, `remark-gfm`, `rehype-pretty-code`, `shiki`
- [ ] Install `@tailwindcss/typography`
- [ ] Verify all packages install without errors

### Task 3.2 — Create ArticleContent component with markdown rendering
- [ ] Create `components/shared/ArticleContent.tsx`
- [ ] Use `react-markdown` with `remark-gfm` for GFM support (tables, task lists, etc.)
- [ ] Add `rehype-pretty-code` with shiki for syntax highlighting (theme: github-dark)
- [ ] Apply `@tailwindcss/typography` prose class to markdown content
- [ ] Handle code blocks with copy-to-clipboard button
- [ ] Render in `app/news/[slug]/page.tsx` replacing raw content display

### Task 3.3 — Add Table of Contents (TOC)
- [ ] Create `components/shared/TableOfContents.tsx`
- [ ] Extract `##` and `###` headings from article content client-side
- [ ] Render sticky TOC sidebar on article pages
- [ ] Highlight active section on scroll (Intersection Observer)
- [ ] Add smooth scroll on TOC item click

### Task 3.4 — Article footer components
- [ ] Create `components/shared/AuthorCard.tsx` (avatar, name, bio)
- [ ] Create `components/shared/RelatedArticles.tsx` (3-4 article cards by tag overlap)
- [ ] Add article footer section below content in `news/[slug]/page.tsx`

---

## Phase 4: Search, Pagination, Category Filters

### Task 4.1 — Server-side pagination for News/Tools
- [ ] Add pagination to `news/page.tsx`: 12 items/page, prev/next buttons
- [ ] Add pagination to `tools/page.tsx`: 12 items/page, prev/next buttons
- [ ] Use URL search params for page state (`?page=2`)
- [ ] Show total count and current range "Showing 1-12 of 47"

### Task 4.2 — Full-text search
- [ ] Add Supabase `tsvector` column + GIN index to `articles` table (if not exists)
- [ ] Create `/api/search` route handler searching articles by title/content
- [ ] Add search bar to News page header
- [ ] Display search results with highlighted matching text

### Task 4.3 — Category/tag URL filters
- [ ] Add category filter tabs to News page (All, AI News, Tools, Tutorials, Trends)
- [ ] Add tag filter dropdown to News page
- [ ] Sync filters with URL search params (`?category=AI+News&tag=GPT-4`)
- [ ] Preserve search query when filtering

### Task 4.4 — Article view counter
- [ ] Create Supabase RPC function `increment_view_count(article_slug)`
- [ ] Call RPC on article page mount (client-side)
- [ ] Display view count on article card and detail page

### Task 4.5 — Related articles recommendation
- [ ] Query articles sharing at least one tag with current article
- [ ] Order by tag overlap count, then by recency
- [ ] Display 3 related articles in footer section

---

## Verification

Each task:
1. Verify build passes: `npm run build`
2. Verify dev server runs: `npm run dev`
3. Manual browser check for rendering correctness
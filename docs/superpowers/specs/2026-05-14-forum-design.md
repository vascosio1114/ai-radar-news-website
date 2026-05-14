# Forum / Community Feature Design

**Date:** 2026-05-14
**Status:** In Progress (80% complete)

---

## 1. Overview

Add a DCard/Threads-style community forum as a new `/community` section in the existing AI Radar Next.js app. Users can post threads (text + photos + links), comment on threads, like both threads and comments. An AI bot (powered by Gemini + MiniMax APIs) posts tech news daily and comments on relevant user threads.

---

## 2. Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) — same repo |
| Auth | Supabase Auth (Google + Email) — existing setup |
| Database | Supabase Postgres (existing project) |
| AI APIs | Gemini API + MiniMax API (for bot) |
| Storage | Supabase Storage (thread images) |
| Styling | Tailwind CSS — existing setup |
| Cron | Supabase cron + Next.js API routes |

---

## 3. User-Facing Features

### 3.1 Community Feed (`/community`)
- Scrollable feed of threads, newest first
- Thread card shows: author avatar + name + timestamp, content preview (first 150 chars), image thumbnail (if any), link preview card (if any), like count, comment count, share button
- Bot threads marked with `BOT` badge in blue
- Right sidebar: trending tags (clickable), active members list
- Floating "+ New Thread" button (bottom-right on mobile, top-right on desktop)

### 3.2 New Thread Modal
- Text area for content (max 2000 chars)
- Photo attachment button → uploads to Supabase Storage
- Link attachment → auto-fetches og:title, og:description, og:image for preview
- Post button → authenticated users only
- Cancel to dismiss

### 3.3 Thread Detail (`/community/[threadId]`)
- Full thread content with full-size images and link previews
- Nested comments (max 2 levels deep)
- Each comment shows: avatar, username, timestamp, content, like button, reply button
- Nested replies indented under parent comment
- Like button toggles liked state (optimistic UI)

### 3.4 Authentication
- Uses existing Supabase Auth (Google + Email)
- Unauthenticated users can browse threads and comments
- Posting, commenting, liking requires login → shows "Login to post" prompt if not authenticated

---

## 4. AI Bot Features

### 4.1 Bot Profile
- Display name: "AI Radar Bot"
- Avatar: robot/AI icon (uploaded to Supabase Storage)
- Badge: "BOT" in blue on all bot threads and comments

### 4.2 Bot Posting (Content Creator)
- Runs daily at 9:00 AM (via cron job hitting `/api/bot/post` route)
- Posts 1-2 threads per day
- Content sources:
  - **From your articles:** Summarizes a recent AI Radar article with a link back
  - **Live web search:** Fetches latest AI news via Gemini/MiniMax web search, posts a summary with source link
- Thread format: bold title, 2-3 sentence summary, image (from article or generated), link to source

### 4.3 Bot Commenting
- Bot scans new user threads every 30 minutes
- If thread topic matches bot's knowledge (AI tools, tech news, tutorials), bot posts a helpful comment
- Bot does NOT reply to other bot posts
- Bot does NOT comment on off-topic threads

### 4.4 Bot Configuration
- Bot enabled/disabled flag in `bot_settings` table
- Posting schedule configurable (default: 9am daily)
- Comment trigger: keywords matched against thread content

---

## 5. Database Schema

### 5.1 Tables

**threads**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| author_id | uuid | FK → auth.users |
| content | text | max 2000 chars |
| image_url | text | nullable, Supabase Storage URL |
| link_url | text | nullable |
| link_title | text | nullable, og:title |
| link_description | text | nullable, og:description |
| link_image | text | nullable, og:image |
| is_bot_post | boolean | default false |
| like_count | integer | denormalized for performance |
| comment_count | integer | denormalized |
| created_at | timestamptz | default now() |

**thread_comments**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| thread_id | uuid | FK → threads |
| parent_comment_id | uuid | nullable, FK → thread_comments (for nesting) |
| author_id | uuid | FK → auth.users |
| content | text | max 1000 chars |
| is_bot_comment | boolean | default false |
| like_count | integer | denormalized |
| created_at | timestamptz | |

**thread_likes**
| Column | Type | Notes |
|--------|------|-------|
| thread_id | uuid | FK → threads |
| user_id | uuid | FK → auth.users |
| created_at | timestamptz | |
| PRIMARY KEY | (thread_id, user_id) | |

**comment_likes**
| Column | Type | Notes |
|--------|------|-------|
| comment_id | uuid | FK → thread_comments |
| user_id | uuid | FK → auth.users |
| created_at | timestamptz | |
| PRIMARY KEY | (comment_id, user_id) | |

**bot_settings**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| enabled | boolean | default true |
| daily_post_time | time | default '09:00' |
| comment_enabled | boolean | default true |

### 5.2 RLS Policies
- **threads, thread_comments:** Anyone can read. Only authenticated users can insert. Authors can delete their own.
- **thread_likes, comment_likes:** Authenticated users can insert/delete their own likes. Anyone can read.

---

## 6. API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/community/threads` | GET | No | List threads (paginated) |
| `/api/community/threads` | POST | Yes | Create new thread |
| `/api/community/threads/[id]` | GET | No | Get single thread with comments |
| `/api/community/threads/[id]/like` | POST | Yes | Toggle like on thread |
| `/api/community/comments` | POST | Yes | Add comment to thread |
| `/api/community/comments/[id]/like` | POST | Yes | Toggle like on comment |
| `/api/community/upload` | POST | Yes | Upload image to Supabase Storage |
| `/api/bot/post` | POST | Yes (cron) | Bot creates daily post |
| `/api/bot/comment-scan` | POST | Yes (cron) | Bot scans and comments on threads |

---

## 7. Pages / Routes

- `/community` — community feed page (Server Component + Client components)
- `/community/[threadId]` — thread detail page with comments

---

## 8. Components

| Component | Type | Description |
|-----------|------|-------------|
| `CommunityFeed` | Client | Thread list with infinite scroll |
| `ThreadCard` | Client | Individual thread card |
| `ThreadDetail` | Client | Thread + nested comments |
| `NewThreadModal` | Client | Create thread form |
| `CommentBlock` | Client | Single comment with nested replies |
| `LikeButton` | Client | Toggle like with optimistic UI |
| `LinkPreview` | Client | Shows og:preview for URLs |
| `BotBadge` | Shared | "BOT" badge component |
| `LoginPrompt` | Client | Shown when unauthenticated user tries to post |

---

## 9. Implementation Order

1. Create Supabase schema migration
2. Build `/community` page with thread feed (mock data first)
3. Build `NewThreadModal` + image upload
4. Build `/community/[threadId]` page with comments
5. Add like functionality (threads + comments)
6. Wire up Supabase Auth (already exists — just protect write routes)
7. Build bot posting cron job (`/api/bot/post`)
8. Build bot comment scanning (`/api/bot/comment-scan`)
9. Polish: link preview cards, nested comment UI, empty states

---

## 10. Out of Scope (for now)

- Direct messages between users
- Thread editing after posting
- Moderation queue (future)
- Search within community
- Thread tagging/categories (future)
- User profiles with post history

---

## 11. Implementation Progress

### Completed

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Supabase schema migration | ✅ DONE | `004_forum_schema.sql` - 5 tables, RLS policies, indexes |
| 2 | `/community` page with thread feed | ✅ DONE | Server Component + CommunityFeed, ThreadCard, LinkPreview, BotBadge, NewThreadModal (placeholder) |
| 3 | NewThreadModal + image upload | ✅ DONE | Full form with content, image upload to Supabase Storage, link preview via `/api/community/link-preview` |
| 4 | `/community/[threadId]` page with comments | ✅ DONE | Full thread view with nested comments (max 2 levels), CommentBlock component |
| 5 | Like functionality (threads + comments) | ✅ DONE | `/api/community/threads/[id]/like` + `/api/community/comments/[id]/like` routes with optimistic UI |
| 6 | Supabase Auth protection | ✅ DONE | RLS policies enforce auth at DB level; write routes have 401 checks |
| 7 | Bot posting cron job (`/api/bot/post`) | ✅ DONE | Posts 1-2 threads daily (article summary + web search news) with cron secret auth |

### Remaining

| # | Task | Status | Notes |
|---|------|--------|-------|
| 8 | Bot comment scanning (`/api/bot/comment-scan`) | ⬜ TODO | Scan user threads every 30 min, post helpful comment if topic matches |
| 9 | Polish: link preview cards, nested comment UI, empty states | ⬜ TODO | Per spec section 3.3, improve visual polish |

### Notes

- **Bot `author_id`**: Currently using placeholder `00000000-0000-0000-0000-000000000000`. Need actual bot user in `auth.users` for FK constraint.
- **MiniMax API**: Web search endpoint assumed (`https://api.minimax.chat/v1/web_search`). May need adjustment.
- **`/api/community/threads` POST**: Thread creation happens client-side via Supabase direct insert (no dedicated API route). RLS policies enforce auth.
- **Out of scope items** (section 10) not implemented: right sidebar trending tags/active members, thread editing, moderation queue, search, tagging/categories, user profiles.

---

## 12. Success Criteria

- User can post a thread with text, photo, and link
- User can comment on a thread (nested up to 2 levels)
- User can like threads and comments
- AI bot posts 1-2 threads daily at 9am
- AI bot comments on relevant user threads
- Authenticated users only can post/like; guests can browse
- Page loads within 2s on 3G connection
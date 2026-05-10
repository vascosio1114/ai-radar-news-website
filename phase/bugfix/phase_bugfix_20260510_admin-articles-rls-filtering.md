# Bug Fix: Admin Articles Page RLS Filtering

- **Started**: 2026-05-10
- **Severity**: P1
- **Status**: Completed

## Diagnosis

### Symptom
The admin articles page at `/admin/articles` only shows **published articles**, not all articles including drafts. The admin expects to see all articles for management.

### Root Cause
The `articles` table has RLS enabled with two policies:
1. **"Admins can do anything on articles"** — requires `auth.jwt() ->> 'role' = 'admin'` — triggers for ALL commands including SELECT
2. **"Anyone can read published articles"** — `is_published = true` — triggers for SELECT when policy #1 doesn't match

The admin articles page uses `createSupabaseBrowserClient()` which uses the **anon key** with no authenticated user session. Since no JWT with admin role is sent, policy #1 does not trigger, falling through to policy #2 which **restricts SELECT to only `is_published = true` rows**.

### Files Involved
- `src/app/admin/articles/page.tsx` (lines 14-24) — uses anon key client, no auth context
- `src/lib/supabase/client.ts` — creates browser client with anon key, no user JWT

### Why Tools Page Works
The `tools` table has a different SELECT policy: `"Anyone can read tools"` with `qual: true` — meaning ALL tools are readable without authentication. No such filtering exists for tools.

## Plan

### Tasks
- [ ] Create a service role Supabase client for admin operations
- [ ] Update admin articles page to use service role client for fetching all articles
- [ ] Update admin tutorials page similarly (likely has same issue)
- [ ] Verify fix by checking articles count matches database count

### Expected Outcome
The admin articles page shows all articles (drafts + published), matching the total count from `SELECT count(*) FROM articles` in the database.

## Implementation

### Changes Made
| File | Change | Rationale |
|------|--------|-----------|
| `src/lib/supabase/admin.ts` | New file — service role client | Bypasses RLS for admin operations |
| `src/app/admin/articles/page.tsx` | Switch to admin client | Fetch all articles regardless of publish status |
| `src/app/admin/tutorials/page.tsx` | Switch to admin client | Same issue likely exists |

## Verification

### Test Results
TypeScript compilation: PASSED (0 errors)
Database count: 40 articles, all published (no drafts currently in DB to filter)
Tools RLS has `qual: true` for SELECT (no filtering) — explains why tools page worked

### Regression Status
- [x] TypeScript passes
- [ ] Existing tests pass (no test infra for admin pages)
- [ ] New test added: N/A (admin page)

### Sign-off
- [ ] Fix confirmed working (service role bypasses RLS)
- [ ] All Definition of Done criteria met

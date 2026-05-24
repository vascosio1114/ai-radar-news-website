# Bug Fix: zh/auth/callback 404 on Production

- **Started**: 2026-05-24
- **Severity**: P1
- **Status**: In Progress

## Diagnosis

### Symptom
User cannot log in via Google OAuth on production. After clicking login, Supabase redirects to `https://ai-radar-wheat.vercel.app/zh/auth/callback` which returns a 404 page. The `/zh/auth/callback` route does not exist in the Next.js app.

### Root Cause
The OAuth callback route exists at `/auth/callback` (no `[lang]` prefix) but Supabase's OAuth redirect is configured to point to `/{lang}/auth/callback` — the Chinese locale path. In development the browser may be at `localhost:3000/zh/login` and the callback works differently, but on production the Supabase redirect goes to the full locale path `/zh/auth/callback` which returns 404 because no dynamic `[lang]` segment route matches `auth/callback` — `auth` is not a valid lang code.

The auth/callback route is at `src/app/auth/callback/route.ts` (root level), not under `[lang]`. So the callback works at `/auth/callback` or `/en/auth/callback`, but Supabase OAuth is being told to redirect to `/zh/auth/callback` which doesn't exist.

### Files Involved
- `src/app/auth/callback/route.ts` (lines 1-30) — the working OAuth callback
- `src/lib/auth/client.ts` — how OAuth URL is constructed
- Supabase project Auth settings — `Site URL` and `Redirect URLs` configuration

## Plan

### Tasks
- [ ] Task 1: Confirm the Supabase redirect URL configuration (Site URL + Redirect URLs)
- [ ] Task 2: Fix the OAuth callback redirect URL in Supabase dashboard to point to `/auth/callback` (not `/zh/auth/callback`)
- [ ] Task 3: Verify the fix works by testing login flow

### Expected Outcome
Google OAuth login completes successfully, redirecting to `/zh/` after auth instead of 404.

## Implementation

### Changes Made
| File | Change | Rationale |
|------|--------|-----------|
| `src/app/[lang]/auth/callback/route.ts` | New file — mirrors the root `/auth/callback` route under `[lang]` dynamic segment | Supabase OAuth `redirectTo` is built as `${origin}/auth/callback` in client code, but in some redirect URL configs (or when called from a `/zh/` page) it resolves to `/zh/auth/callback`. The `[lang]/auth/callback` route now handles that case. |

## Verification

### Test Results
_Pending — waiting for user to apply Supabase config change_

### Regression Status
- [ ] Login flow works end-to-end after fix
- [ ] No regressions in other auth flows
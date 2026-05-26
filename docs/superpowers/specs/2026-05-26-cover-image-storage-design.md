# Cover Image Storage for Articles & Tutorials

**Date:** 2026-05-26
**Status:** Approved

## Overview

Enable admins to upload cover images for blog posts and tutorials using Supabase Storage. Each content type gets its own bucket for clear separation.

## Storage Buckets

| Bucket ID | Public Read | Admin Write | Content |
|-----------|-------------|-------------|---------|
| `article-covers` | Yes | Yes (admin only) | Blog post cover images |
| `tutorial-covers` | Yes | Yes (admin only) | Tutorial cover images |

## RLS Policies

```sql
-- article-covers bucket
insert into storage.buckets (id, name, public) values ('article-covers', 'article-covers', true);
create policy "Anyone can view article cover images" on storage.objects for select using (bucket_id = 'article-covers');
create policy "Admins can upload article cover images" on storage.objects for insert with check (bucket_id = 'article-covers' and auth.jwt() ->> 'role' = 'authenticated');

-- tutorial-covers bucket
insert into storage.buckets (id, name, public) values ('tutorial-covers', 'tutorial-covers', true);
create policy "Anyone can view tutorial cover images" on storage.objects for select using (bucket_id = 'tutorial-covers');
create policy "Admins can upload tutorial cover images" on storage.objects for insert with check (bucket_id = 'tutorial-covers' and auth.jwt() ->> 'role' = 'authenticated');
```

Note: Current admin check uses `auth.jwt() ->> 'role' = 'authenticated'` — verify this matches your Supabase auth setup. The existing `thread-images` policy uses `auth.role() = 'authenticated'`.

## Implementation

### 1. SQL Migration
File: `supabase/migrations/013_cover_image_buckets.sql`

Create both buckets with RLS policies.

### 2. Storage Helper
File: `src/lib/supabase/storage.ts`

```typescript
import { createSupabaseBrowserClient } from "./client";

export async function uploadCoverImage(
  file: File,
  bucket: "article-covers" | "tutorial-covers"
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
```

### 3. ArticleForm Update
File: `src/components/admin/ArticleForm.tsx`

- Import `uploadCoverImage` from `@/lib/supabase/storage`
- Update `handleImageUpload` to call `uploadCoverImage(file, "article-covers")`
- Remove API route dependency `/api/admin/articles/upload-image`

### 4. TutorialForm Update
File: `src/components/admin/TutorialForm.tsx`

- Import `uploadCoverImage` from `@/lib/supabase/storage`
- Update `handleImageUpload` to call `uploadUploadImage(file, "tutorial-covers")`
- Change bucket reference from `covers` to `tutorial-covers`

### 5. Cleanup (Optional)
- Remove `/api/admin/articles/upload-image/route.ts` if no longer needed
- Drop `covers` bucket if unused

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/013_cover_image_buckets.sql` | Create |
| `src/lib/supabase/storage.ts` | Create |
| `src/components/admin/ArticleForm.tsx` | Modify |
| `src/components/admin/TutorialForm.tsx` | Modify |

## Constraints

- Max file size: 10MB
- Allowed types: jpg, jpeg, png, gif, webp
- Images are always public (no auth required to view)
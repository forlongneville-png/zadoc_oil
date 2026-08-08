-- ============================================================================
-- ZADOC — STORAGE BUCKET POLICIES
-- ============================================================================
-- Run this AFTER zadoc_schema.sql (which already creates the 3 buckets).
-- If you already ran zadoc_schema.sql, the buckets exist — this file only
-- adds the access rules for storage.objects.
--
-- Rule of thumb across this whole app: the browser (anon key) NEVER writes
-- to storage directly. All uploads (face photos, product images, influencer
-- media) go through your Next.js API routes using the service role key,
-- which bypasses RLS entirely. These policies only control what the PUBLIC
-- (anon/authenticated) key is allowed to READ.
-- ============================================================================

-- storage.objects ships with RLS already enabled on every Supabase project,
-- owned by the supabase_storage_admin role. Your project role isn't the
-- table owner, so an explicit "ALTER TABLE ... ENABLE ROW LEVEL SECURITY"
-- here would fail with "must be owner of table objects" — it's unnecessary
-- anyway since RLS is already on. Skip straight to the policies below.

-- ----------------------------------------------------------------------------
-- 1. profile-images (PRIVATE — face photos)
-- ----------------------------------------------------------------------------
-- No policies = no access at all for anon/authenticated keys, in either
-- direction. Every read must go through a server-generated signed URL
-- (createSignedUrl with the service role key, short expiry, e.g. 5 min).
-- Do not add a select policy here — that would make face images world
-- readable to anyone who guesses/enumerates a file path.

-- (intentionally no policies for the 'profile-images' bucket)

-- ----------------------------------------------------------------------------
-- 2. product-images (PUBLIC READ — oil product photos)
-- ----------------------------------------------------------------------------
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- No insert/update/delete policy -> only the service role (admin CRUD API)
-- can write here. The public key can look but never touch.

-- ----------------------------------------------------------------------------
-- 3. influencer-media (PUBLIC READ — creator photos/thumbnails)
-- ----------------------------------------------------------------------------
drop policy if exists "public read influencer media" on storage.objects;
create policy "public read influencer media"
  on storage.objects for select
  using (bucket_id = 'influencer-media');

-- Same as above: reads are public, writes are service-role-only.

-- ============================================================================
-- SANITY CHECKS — run these after applying, should return your 3 buckets
-- and confirm profile-images has 0 policies while the other two have 1 each.
-- ============================================================================
-- select id, name, public from storage.buckets;
-- select bucket_id, policyname from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';
-- ============================================================================
-- DONE.
-- ============================================================================

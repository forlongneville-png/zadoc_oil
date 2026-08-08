-- ============================================================================
-- ZADOC — SKIN ANALYSIS APP — SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Product: AI skincare discovery. Photo -> Claude vision -> skin profile ->
-- oil recommendations -> 129 FCFA unlock via Fapshi.
--
-- This is a STANDALONE schema for the skin-analysis version of Zadoc.
-- It does not touch or reference the current file-distribution Zadoc DB.
--
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)
-- Safe to re-run: everything is CREATE ... IF NOT EXISTS / DROP ... IF EXISTS
-- where it matters, but on a totally fresh project just run it once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 0.1 SHARED HELPER: auto-update updated_at columns
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. USERS  (the account — auth, payment, creator relationship)
-- ============================================================================
create table if not exists public.users (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text not null unique
                 check (phone ~ '^\+2376\d{8}$'),   -- normalized +2376XXXXXXXX
  pin_hash     text not null,                        -- bcrypt/argon2 hash, never plaintext
  role         text not null default 'user'
                 check (role in ('user','creator','admin')),
  language     text not null default 'en'
                 check (language in ('en','fr')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index if not exists idx_users_phone on public.users(phone) where deleted_at is null;
create index if not exists idx_users_role  on public.users(role);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. CREATORS  (referral/influencer accounts — 1:1 with a user)
-- ============================================================================
create table if not exists public.creators (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references public.users(id) on delete cascade,
  referral_code    text not null unique,             -- e.g. "creator123"
  commission_rate  numeric(5,2) not null default 10.00
                     check (commission_rate >= 0 and commission_rate <= 100),
  status           text not null default 'active'
                     check (status in ('active','suspended')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_creators_referral_code on public.creators(referral_code);

drop trigger if exists trg_creators_updated_at on public.creators;
create trigger trg_creators_updated_at
  before update on public.creators
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2.1 REFERRAL CLICKS  (unique-visit attribution, not raw pageview counting)
-- ----------------------------------------------------------------------------
create table if not exists public.referral_clicks (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid not null references public.creators(id) on delete cascade,
  attribution_id text not null,      -- client-generated id, stored in localStorage/cookie
  ip_hash        text,               -- hashed, not raw IP
  user_agent     text,
  created_at     timestamptz not null default now(),
  unique (creator_id, attribution_id)  -- one refresh from the same visitor = one click
);

create index if not exists idx_referral_clicks_creator on public.referral_clicks(creator_id);

-- ----------------------------------------------------------------------------
-- 2.2 REFERRALS  (confirmed signup attribution — 1 row per referred user)
-- ----------------------------------------------------------------------------
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid not null references public.creators(id) on delete cascade,
  user_id        uuid not null unique references public.users(id) on delete cascade,
  attribution_id text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_referrals_creator on public.referrals(creator_id);

-- ============================================================================
-- 3. PROFILES  (the person being analyzed — not the same as the account)
-- ============================================================================
create table if not exists public.profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  name               text not null,
  image_url          text,                      -- private bucket signed URL / path
  age                int check (age is null or (age > 0 and age < 120)),
  gender             text check (gender in ('female','male','prefer_not_to_say')),
  routine_level      text check (routine_level in ('none','simple','moderate','detailed')),
  reported_condition text,                       -- user-reported, never AI-diagnosed
  skin_type          text check (skin_type in ('dry','oily','combination','normal','sensitive')),
  skin_score         int check (skin_score is null or (skin_score between 0 and 100)),
  analysis_status    text not null default 'empty'
                       check (analysis_status in ('empty','collecting','processing','complete','failed')),
  is_unlocked        boolean not null default false,   -- denormalized entitlement flag (fast reads)
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_profiles_user on public.profiles(user_id);
create index if not exists idx_profiles_status on public.profiles(analysis_status);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. SKIN ANALYSES  (history — every scan of a profile, not just the latest)
-- ============================================================================
create table if not exists public.skin_analyses (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  image_url     text not null,
  skin_type     text check (skin_type in ('dry','oily','combination','normal','sensitive')),
  skin_score    int check (skin_score between 0 and 100),
  insights_json jsonb not null default '[]'::jsonb,  -- Claude's structured output, validated server-side
  model          text not null,                       -- e.g. "claude-sonnet-5"
  created_at    timestamptz not null default now()
);

create index if not exists idx_skin_analyses_profile on public.skin_analyses(profile_id, created_at desc);

-- ============================================================================
-- 5. PRODUCTS  (oils — catalog, DB-driven, never invented by the AI)
-- ============================================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  category    text,
  benefits    jsonb not null default '[]'::jsonb,   -- array of strings
  usage       text,
  warnings    text,
  active      boolean not null default true,        -- soft delete only — never hard-delete
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_products_active on public.products(active);
create index if not exists idx_products_slug on public.products(slug);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5.1 PRODUCT IMAGES  (1–5 per product, enforced at the app layer on write)
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  image_url      text not null,
  display_order  int not null default 0
);

create index if not exists idx_product_images_product on public.product_images(product_id, display_order);

-- ----------------------------------------------------------------------------
-- 5.2 PRODUCT RECOMMENDATIONS  (per-skin-type ranking, best/avoid, 1–10)
-- ----------------------------------------------------------------------------
create table if not exists public.product_recommendations (
  id                   uuid primary key default gen_random_uuid(),
  product_id           uuid not null references public.products(id) on delete cascade,
  skin_type            text not null check (skin_type in ('dry','oily','combination','normal','sensitive')),
  recommendation_type  text not null check (recommendation_type in ('best','avoid')),
  rank                 int not null check (rank between 1 and 10),
  reason               text,
  unique (skin_type, recommendation_type, rank)   -- can't have two #1 "best for oily"
);

create index if not exists idx_product_recs_lookup
  on public.product_recommendations(skin_type, recommendation_type, rank);

-- ============================================================================
-- 6. PAYMENTS  (129 FCFA, one-time per profile unlock, via Fapshi)
-- ============================================================================
create table if not exists public.payments (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  profile_id               uuid not null references public.profiles(id) on delete cascade,
  amount                   numeric(10,2) not null default 129.00,
  currency                 text not null default 'XAF',
  provider                 text not null default 'fapshi',
  provider_transaction_id  text unique,      -- Fapshi's transId — set once payment starts
  external_id              text unique,      -- our own id, e.g. ZADOC-PROFILE-<id>-PAYMENT-<n>
  status                   text not null default 'created'
                             check (status in ('created','pending','successful','failed','expired')),
  created_at               timestamptz not null default now(),
  confirmed_at             timestamptz
);

create index if not exists idx_payments_profile on public.payments(profile_id, status);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);

-- ============================================================================
-- 7. CREATOR EARNINGS  (commission locked in at time of transaction)
-- ============================================================================
create table if not exists public.creator_earnings (
  id                  uuid primary key default gen_random_uuid(),
  creator_id          uuid not null references public.creators(id) on delete cascade,
  payment_id          uuid not null unique references public.payments(id) on delete cascade,
  commission_rate     numeric(5,2) not null,   -- snapshot of creators.commission_rate at the time
  gross_amount        numeric(10,2) not null,
  commission_amount   numeric(10,2) not null,
  status              text not null default 'pending'
                        check (status in ('pending','available','requested','paid','rejected')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

create index if not exists idx_creator_earnings_creator on public.creator_earnings(creator_id, status);

-- ----------------------------------------------------------------------------
-- 7.1 PAYOUT REQUESTS  (creator withdrawal — Sat/Sun only, enforced in app)
-- ----------------------------------------------------------------------------
create table if not exists public.payout_requests (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references public.creators(id) on delete cascade,
  amount        numeric(10,2) not null check (amount > 0),
  status        text not null default 'requested'
                  check (status in ('requested','approved','paid','rejected')),
  requested_at  timestamptz not null default now(),
  processed_at  timestamptz
);

create index if not exists idx_payout_requests_creator on public.payout_requests(creator_id, status);

-- ============================================================================
-- 8. INFLUENCERS  (landing-page social proof — DB-driven, no hardcoded cards)
-- ============================================================================
create table if not exists public.influencers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  image_url      text,
  bio            text,
  active         boolean not null default true,
  display_order  int not null default 0
);

create table if not exists public.influencer_videos (
  id             uuid primary key default gen_random_uuid(),
  influencer_id  uuid not null references public.influencers(id) on delete cascade,
  platform       text not null,        -- 'tiktok' | 'youtube' | 'instagram' etc.
  video_url      text not null,
  thumbnail_url  text,
  active         boolean not null default true,
  display_order  int not null default 0
);

create index if not exists idx_influencer_videos_influencer on public.influencer_videos(influencer_id);

-- ============================================================================
-- 9. BUSINESS-LOGIC TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9.1 On payment -> successful: unlock the profile + create the creator
--     earning exactly once. This is what makes duplicate Fapshi webhooks safe.
-- ----------------------------------------------------------------------------
create or replace function public.handle_successful_payment()
returns trigger
language plpgsql
as $$
declare
  v_creator record;
begin
  -- Only act on the transition INTO 'successful'
  if new.status = 'successful' and (old.status is distinct from 'successful') then

    if new.confirmed_at is null then
      new.confirmed_at := now();
    end if;

    -- Unlock the profile (idempotent — safe to run repeatedly)
    update public.profiles
      set is_unlocked = true
      where id = new.profile_id;

    -- Attribute commission to the referring creator, if any, locking in
    -- their CURRENT rate at the moment of this payment.
    select c.id, c.commission_rate
      into v_creator
      from public.referrals r
      join public.creators c on c.id = r.creator_id
      where r.user_id = new.user_id
      limit 1;

    if v_creator.id is not null then
      insert into public.creator_earnings
        (creator_id, payment_id, commission_rate, gross_amount, commission_amount, status)
      values
        (v_creator.id, new.id, v_creator.commission_rate, new.amount,
         round(new.amount * v_creator.commission_rate / 100, 2), 'pending')
      on conflict (payment_id) do nothing;  -- belt-and-braces idempotency
    end if;

  end if;

  return new;
end;
$$;

drop trigger if exists trg_payments_successful on public.payments;
create trigger trg_payments_successful
  before update on public.payments
  for each row execute function public.handle_successful_payment();

-- Also cover the (unusual) case where a payment is inserted already successful
drop trigger if exists trg_payments_successful_insert on public.payments;
create trigger trg_payments_successful_insert
  before insert on public.payments
  for each row
  when (new.status = 'successful')
  execute function public.handle_successful_payment();

-- ============================================================================
-- 10. HELPER VIEWS / FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 10.1 Admin overview (section 74) — one cheap call for the admin dashboard
-- ----------------------------------------------------------------------------
create or replace view public.admin_overview as
select
  (select count(*) from public.users where deleted_at is null)                       as total_users,
  (select count(*) from public.profiles)                                             as total_profiles,
  (select count(*) from public.skin_analyses)                                        as total_scans,
  (select count(distinct profile_id) from public.payments where status = 'successful') as paid_customers,
  (select coalesce(sum(amount), 0) from public.payments where status = 'successful') as total_revenue,
  (select coalesce(sum(commission_amount), 0) from public.creator_earnings)          as creator_commissions;

-- ----------------------------------------------------------------------------
-- 10.2 Withdrawal window helper (Sat/Sun only) — reference for app logic
-- ----------------------------------------------------------------------------
create or replace function public.is_withdrawal_window()
returns boolean
language sql
stable
as $$
  select extract(isodow from now()) in (6, 7);  -- 6 = Saturday, 7 = Sunday
$$;

-- ============================================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================================
-- Zadoc uses custom WhatsApp+PIN auth, NOT Supabase Auth — so there is no
-- auth.uid() to key policies off. Every read/write MUST go through your
-- Next.js API routes using the SERVICE ROLE key (which bypasses RLS).
-- RLS is enabled with NO policies below, which means the anon/authenticated
-- keys get zero direct access to any table. This is intentional and matches
-- section 92–93 of the spec: authorization must happen server-side only.

alter table public.users                 enable row level security;
alter table public.creators               enable row level security;
alter table public.referral_clicks        enable row level security;
alter table public.referrals              enable row level security;
alter table public.profiles               enable row level security;
alter table public.skin_analyses          enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_recommendations enable row level security;
alter table public.payments               enable row level security;
alter table public.creator_earnings       enable row level security;
alter table public.payout_requests        enable row level security;
alter table public.influencers            enable row level security;
alter table public.influencer_videos      enable row level security;

-- No policies are created on purpose — see note above.
-- If you ever want the browser to read PUBLIC data directly (e.g. the
-- landing page's active influencer cards) without going through an API
-- route, uncomment this narrow, read-only exception:
--
-- create policy "public can read active influencers"
--   on public.influencers for select
--   using (active = true);
--
-- create policy "public can read active influencer videos"
--   on public.influencer_videos for select
--   using (active = true);

-- ============================================================================
-- 12. STORAGE (private buckets for face images — section 94)
-- ============================================================================
-- Run once. Face photos must NEVER be public. Product/influencer images can be.
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('influencer-media', 'influencer-media', true)
on conflict (id) do nothing;

-- ============================================================================
-- DONE.
-- ============================================================================

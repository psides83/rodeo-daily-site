-- Rodeo Daily news tables for Supabase.
-- Run this in the Supabase SQL editor for the existing Rodeo Daily project.

create extension if not exists pgcrypto;

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  category text not null default 'Pro Rodeo Roundup',
  author text not null default 'Rodeo Daily',
  tags text[] not null default '{}',
  hero_image text,
  source_urls text[] not null default '{}',
  featured boolean not null default false,
  story_score integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_story_candidates (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text,
  source_url text,
  source_name text,
  detected_athlete_name text,
  detected_event text,
  keywords text[] not null default '{}',
  published_at timestamptz,
  relevance_score integer,
  selected boolean not null default false,
  article_id uuid references public.news_posts(id) on delete set null,
  dismissed_at timestamptz,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.news_story_candidates add column if not exists detected_athlete_name text;
alter table public.news_story_candidates add column if not exists detected_event text;
alter table public.news_story_candidates add column if not exists keywords text[] not null default '{}';
alter table public.news_story_candidates add column if not exists published_at timestamptz;
alter table public.news_story_candidates add column if not exists dismissed_at timestamptz;

create table if not exists public.news_sources (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.news_posts(id) on delete cascade,
  url text not null,
  title text,
  publisher text,
  checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.news_standings_snapshots (
  id uuid primary key default gen_random_uuid(),
  season_year integer not null,
  standing_type text not null,
  event text not null,
  source_updated_at timestamptz,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (season_year, standing_type, event, generated_at)
);

create table if not exists public.news_standings_snapshot_rows (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.news_standings_snapshots(id) on delete cascade,
  contestant_id text,
  name text not null,
  hometown text,
  rank integer not null,
  earnings numeric,
  points numeric,
  image_url text,
  created_at timestamptz not null default now(),
  unique (snapshot_id, rank, name)
);

create table if not exists public.news_story_signals (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  event text,
  contestant_id text,
  contestant_name text,
  signal_type text not null,
  headline_fact text not null,
  supporting_json jsonb not null default '{}'::jsonb,
  source_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (week_start, week_end, event, signal_type, contestant_id, headline_fact)
);

create table if not exists public.news_image_candidates (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.news_posts(id) on delete cascade,
  story_candidate_id uuid references public.news_story_candidates(id) on delete cascade,
  image_url text not null,
  source_page_url text,
  photographer text,
  license_status text,
  caption text,
  review_status text not null default 'needs_review' check (review_status in ('needs_review', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_news_posts_updated_at on public.news_posts;
create trigger set_news_posts_updated_at
before update on public.news_posts
for each row execute function public.set_updated_at();

alter table public.news_posts enable row level security;
alter table public.news_story_candidates enable row level security;
alter table public.news_sources enable row level security;
alter table public.news_standings_snapshots enable row level security;
alter table public.news_standings_snapshot_rows enable row level security;
alter table public.news_story_signals enable row level security;
alter table public.news_image_candidates enable row level security;

drop policy if exists "Published news posts are public" on public.news_posts;
create policy "Published news posts are public"
on public.news_posts
for select
using (status = 'published');

-- Replace this email with your Supabase Auth admin user email before relying on browser-side admin access.
-- The server-side editor API also requires NEWS_ADMIN_EMAILS and SUPABASE_SERVICE_ROLE_KEY.
drop policy if exists "Admins can manage news posts" on public.news_posts;
create policy "Admins can manage news posts"
on public.news_posts
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage story candidates" on public.news_story_candidates;
create policy "Admins can manage story candidates"
on public.news_story_candidates
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage news sources" on public.news_sources;
create policy "Admins can manage news sources"
on public.news_sources
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage standings snapshots" on public.news_standings_snapshots;
create policy "Admins can manage standings snapshots"
on public.news_standings_snapshots
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage standings snapshot rows" on public.news_standings_snapshot_rows;
create policy "Admins can manage standings snapshot rows"
on public.news_standings_snapshot_rows
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage story signals" on public.news_story_signals;
create policy "Admins can manage story signals"
on public.news_story_signals
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

drop policy if exists "Admins can manage image candidates" on public.news_image_candidates;
create policy "Admins can manage image candidates"
on public.news_image_candidates
for all
using ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'))
with check ((auth.jwt() ->> 'email') in ('replace-with-your-admin-email@example.com'));

create index if not exists news_posts_status_published_at_idx on public.news_posts(status, published_at desc);
create index if not exists news_posts_featured_idx on public.news_posts(featured) where featured = true;
create index if not exists news_story_candidates_discovered_at_idx on public.news_story_candidates(discovered_at desc);
create index if not exists news_story_candidates_detected_event_idx on public.news_story_candidates(detected_event);
create index if not exists news_story_candidates_active_idx on public.news_story_candidates(dismissed_at, discovered_at desc);
create index if not exists news_standings_snapshots_lookup_idx on public.news_standings_snapshots(season_year, standing_type, event, generated_at desc);
create index if not exists news_standings_snapshot_rows_snapshot_rank_idx on public.news_standings_snapshot_rows(snapshot_id, rank);
create index if not exists news_story_signals_week_idx on public.news_story_signals(week_start desc, week_end desc);
create index if not exists news_image_candidates_review_idx on public.news_image_candidates(review_status, created_at desc);

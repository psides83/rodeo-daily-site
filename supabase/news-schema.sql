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
  relevance_score integer,
  selected boolean not null default false,
  article_id uuid references public.news_posts(id) on delete set null,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

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

create index if not exists news_posts_status_published_at_idx on public.news_posts(status, published_at desc);
create index if not exists news_posts_featured_idx on public.news_posts(featured) where featured = true;
create index if not exists news_story_candidates_discovered_at_idx on public.news_story_candidates(discovered_at desc);

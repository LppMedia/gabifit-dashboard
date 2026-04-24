-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

-- Weekly review results (one per user per week)
create table if not exists weekly_reviews (
  id               uuid        default gen_random_uuid() primary key,
  user_id          uuid        references auth.users not null,
  week_start_date  date        not null,
  posts            jsonb       not null default '[]',
  analysis         jsonb       not null default '{}',
  scraped_at       timestamptz default now(),
  created_at       timestamptz default now(),
  unique (user_id, week_start_date)
);

alter table weekly_reviews enable row level security;

create policy "Users access own weekly reviews"
  on weekly_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Instagram profile post cache (updated by weekly review + analytics)
create table if not exists ig_profile_cache (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users not null,
  handle     text        not null,
  posts      jsonb       not null default '[]',
  updated_at timestamptz default now(),
  source     text        default 'manual',
  unique (user_id, handle)
);

alter table ig_profile_cache enable row level security;

create policy "Users access own ig cache"
  on ig_profile_cache for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

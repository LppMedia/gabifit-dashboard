-- calendar_posts: cross-platform content calendar entries
create table if not exists public.calendar_posts (
  id           text        primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  date         date        not null,
  time         text,
  platform     text        not null,
  type         text        not null,
  status       text        not null default 'scheduled',
  caption      text,
  format       text,
  hashtags     text,
  script       text,
  notes        text,
  media_files  jsonb,
  engagement   jsonb,
  created_at   timestamptz not null default now()
);

alter table public.calendar_posts enable row level security;

create policy "Users can manage own calendar posts"
  on public.calendar_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists calendar_posts_user_date_idx
  on public.calendar_posts(user_id, date);

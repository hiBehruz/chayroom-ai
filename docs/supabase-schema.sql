-- Run this in Supabase Dashboard > SQL Editor

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  level text not null default 'Начинающий',
  level_color text not null default '#22c55e',
  modules_count int not null default 0,
  lessons_count int not null default 0,
  duration text not null default '',
  cover_url text not null default '',
  bg_color text not null default '#f0f4ff',
  is_dark boolean not null default false,
  kinescope_video_id text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  cover_url text not null default '',
  bg_color text not null default '#0d1117',
  accent_color text not null default '#60a5fa',
  badge text not null default 'гайд',
  is_free boolean not null default false,
  notion_page_id text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Wirddy Supabase Database Schema
-- Version 1.0

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Quran Surahs (Reference table)
create table if not exists public.quran_surahs (
  id integer primary key,
  name_ar text not null,
  name_en text not null,
  transliteration text not null,
  total_ayahs integer not null
);

-- 2. Quran Juz Boundaries (Reference table)
create table if not exists public.quran_juz_boundaries (
  juz_number integer primary key check (juz_number between 1 and 30),
  start_surah_id integer references public.quran_surahs(id),
  start_ayah integer not null,
  end_surah_id integer references public.quran_surahs(id),
  end_ayah integer not null
);

-- 3. Groups Table
create table if not exists public.groups (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid, -- Optional link to auth.users for future auth
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Members Table
create table if not exists public.members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  knowledge_type text not null check (knowledge_type in ('entire', 'juz_range', 'surah_range')),
  start_juz integer not null default 1 check (start_juz between 1 and 30),
  end_juz integer not null default 30 check (end_juz between 1 and 30),
  start_surah integer check (start_surah between 1 and 114),
  end_surah integer check (end_surah between 1 and 114),
  weekly_amount integer not null check (weekly_amount between 1 and 30),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Plans Table
create table if not exists public.plans (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.groups(id) on delete cascade,
  group_name text not null,
  weeks_count integer not null check (weeks_count between 1 and 52),
  total_juz_per_week integer not null default 30 check (total_juz_per_week = 30),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Plan Weeks Table
create table if not exists public.plan_weeks (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  week_number integer not null check (week_number >= 1),
  total_juz integer not null default 30,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (plan_id, week_number)
);

-- 7. Assignments Table
create table if not exists public.assignments (
  id uuid primary key default uuid_generate_v4(),
  plan_week_id uuid not null references public.plan_weeks(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  member_name text not null,
  weekly_amount integer not null check (weekly_amount between 1 and 30),
  start_juz integer not null check (start_juz between 1 and 30),
  end_juz integer not null check (end_juz between 1 and 30),
  start_surah_id integer not null references public.quran_surahs(id),
  start_ayah integer not null,
  end_surah_id integer not null references public.quran_surahs(id),
  end_ayah integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for performance
create index if exists idx_members_group_id on public.members(group_id);
create index if exists idx_plans_group_id on public.plans(group_id);
create index if exists idx_plan_weeks_plan_id on public.plan_weeks(plan_id);
create index if exists idx_assignments_plan_week_id on public.assignments(plan_week_id);

-- Row Level Security (RLS)
alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.plans enable row level security;
alter table public.plan_weeks enable row level security;
alter table public.assignments enable row level security;

-- Anonymous/Public access policies for frictionless v1 (with scope for auth in v2)
create policy "Allow public read access to plans" on public.plans for select using (true);
create policy "Allow public insert to plans" on public.plans for insert with check (true);
create policy "Allow public read access to plan weeks" on public.plan_weeks for select using (true);
create policy "Allow public insert to plan weeks" on public.plan_weeks for insert with check (true);
create policy "Allow public read access to assignments" on public.assignments for select using (true);
create policy "Allow public insert to assignments" on public.assignments for insert with check (true);
